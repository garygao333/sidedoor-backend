import json
from typing import Dict, Any
from core.state import SearchState, set_current_state, clear_current_state
from core.logging import LogHandler, logger
from agents.film_scout import recommend_titles
from agents.vid_scout import run_vid_agent
from utils.helpers import parse_agent_result
from core.state import SearchState
from tools.validation import check_playable
import re


async def run_backend(user_query: str, websocket_manager=None, job_id: str = "") -> Dict[str, Any]:
    # global current_state 
    try:
        state = SearchState(
            query=user_query,
            websocket_manager=websocket_manager,  # Now this will be set!
            job_id=job_id  # Now this will be set!
        )

        current_state = state
        
        await state.log(f"Starting search: {user_query}")

        try:
            movies = await recommend_titles(user_query)
            await state.log(f"Planner step: {movies}")
            logger.info(f"recommend_titles returned: {movies}")
        except Exception as e:
            logger.error(f"Error in recommend_titles: {e}", exc_info=True)
            await state.log(f"Error in recommend_titles: {e}", "error")
            return {"status": "error", "logs": state.logs, "error": str(e)}
        
        if not movies:
            await state.log("FilmScout returned nothing", "error")
            return {"status": "error", "logs": state.logs}

        # Variables to track the successful movie and link
        successful_movie = None
        found_link = None

        for mv in movies:
            try:
                await state.log(f"Trying {mv.get('title', 'Unknown')} ({mv.get('year', 'Unknown')}) …")
                
                # Create callback INSIDE the loop to ensure fresh state reference
                cb = LogHandler(state)
                
                seed = f"\"{mv.get('title', '')}\" {mv.get('year', '')} full movie watch online"
                prompt = (f"Find a playable link for \"{mv.get('title', '')}\" ({mv.get('year', '')}). "
                          f"Start with the query: {seed}")

                result: str = await run_vid_agent(prompt, [cb])
                await state.log(f"VidScout step: {result}")

                # After agent completes, merge any additional logs from callback
                if hasattr(cb, 'state') and cb.state.logs:
                    for log_entry in cb.state.logs:
                        if log_entry not in state.logs:
                            state.logs.append(log_entry)

                # parse VidScout response
                link = None
                await state.log(f"Links: {link}")
                if isinstance(result, str):
                    if result.lstrip().upper().startswith("FINISH:"):
                        link = result.split(":", 1)[1].strip()
                        await state.log(f"Found link: {link}", "success")
                    else:
                        m = URL_RE.search(result)
                        link = m.group(0) if m else None
                        await state.log(f"Found link: {link}", "success")

                if link:
                    state.best = link
                    successful_movie = mv  # Store the successful movie
                    found_link = link      # Store the found link
                    await state.log(f"Success → {link}", "success")
                    break
                    
            except Exception as e:
                logger.error(f"Error processing movie {mv}: {e}", exc_info=True)
                await state.log(f"Error processing movie {mv}: {e}", "error")
                continue
        
        current_state = None

        if not found_link or not successful_movie:
            await state.log("No playable link found for any suggestion", "error")
            # Send error via WebSocket
            if state.websocket_manager:
                await state.websocket_manager.broadcast(
                    state.job_id,
                    {"type": "error", "message": "No playable movies found"}
                )
            return {"status": "error", "logs": state.logs}

        # Build the final result
        final_result = {
            "title": successful_movie.get("title", "Unknown"),
            "year":  successful_movie.get("year", "Unknown"), 
            "why":   successful_movie.get("why", ""),
            "url":   found_link,
        }
        
        # Right before the WebSocket broadcast, add this:
        print(f"🔧 About to broadcast result via WebSocket: {state.websocket_manager}")
        print(f"🔧 Job ID: {state.job_id}")
        print(f"🔧 Result to broadcast: {final_result}")

        # Send result via WebSocket
        if state.websocket_manager:
            print("Broadcasting result...")
            await state.websocket_manager.broadcast(
                state.job_id,
                {
                    "type": "result", 
                    "result": final_result
                }
            )
            print("Broadcast complete!")
        else:
            print("No websocket_manager available!")
        
        # Debug print to see what we're returning
        print(f"Backend returning: {json.dumps(final_result, indent=2)}")
        
        # Still return for any other consumers
        return {
            "status": "completed",
            "result": final_result,
            "logs": state.logs,
        }
    except Exception as e:
        logger.error(f"Unexpected error in run_backend: {e}", exc_info=True)
        return {"status": "error", "error": str(e), "logs": getattr(state, 'logs', [])}

main = run_backend

# # --------------- ad-hoc demo -------------------------------------------------
# if __name__ == "__main__":
#     demo_q = "Find me a good evening movie about finance and entrepreneurship."
#     out = asyncio.run(run_backend(demo_q))
#     print(json.dumps(out, indent=2))