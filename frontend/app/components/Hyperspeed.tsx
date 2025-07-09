'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HyperspeedProps {
  effectOptions?: {
    onSpeedUp?: () => void;
    onSlowDown?: () => void;
    distortion?: string;
    length?: number;
    roadWidth?: number;
    islandWidth?: number;
    lanesPerRoad?: number;
    fov?: number;
    fovSpeedUp?: number;
    speedUp?: number;
    carLightsFade?: number;
    totalSideLightSticks?: number;
    lightPairsPerRoadWay?: number;
    shoulderLinesWidthPercentage?: number;
    brokenLinesWidthPercentage?: number;
    brokenLinesLengthPercentage?: number;
    lightStickWidth?: [number, number];
    lightStickHeight?: [number, number];
    movingAwaySpeed?: [number, number];
    movingCloserSpeed?: [number, number];
    carLightsLength?: [number, number];
    carLightsRadius?: [number, number];
    carWidthPercentage?: [number, number];
    carShiftX?: [number, number];
    carFloorSeparation?: [number, number];
    colors?: {
      roadColor?: number;
      islandColor?: number;
      background?: number;
      shoulderLines?: number;
      brokenLines?: number;
      leftCars?: number[];
      rightCars?: number[];
      sticks?: number;
    };
  };
}

const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions = {} }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Default options
    const options = {
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5] as [number, number],
      lightStickHeight: [1.3, 1.7] as [number, number],
      movingAwaySpeed: [60, 80] as [number, number],
      movingCloserSpeed: [-120, -160] as [number, number],
      carLightsLength: [12, 80] as [number, number],
      carLightsRadius: [0.05, 0.14] as [number, number],
      carWidthPercentage: [0.3, 0.5] as [number, number],
      carShiftX: [-0.8, 0.8] as [number, number],
      carFloorSeparation: [0, 5] as [number, number],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0xFFFFFF,
        brokenLines: 0xFFFFFF,
        leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
        rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
        sticks: 0x03B3C3,
      },
      ...effectOptions
    };

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.colors.background);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      options.fov,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, -20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create road geometry
    const roadGeometry = new THREE.PlaneGeometry(options.roadWidth, options.length);
    const roadMaterial = new THREE.MeshBasicMaterial({ color: options.colors.roadColor });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Create center island
    const islandGeometry = new THREE.PlaneGeometry(options.islandWidth, options.length);
    const islandMaterial = new THREE.MeshBasicMaterial({ color: options.colors.islandColor });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.rotation.x = -Math.PI / 2;
    island.position.y = 0.01;
    scene.add(island);

    // Create light sticks
    const lightSticks: THREE.Mesh[] = [];
    for (let i = 0; i < options.totalSideLightSticks; i++) {
      const stickGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
      const stickMaterial = new THREE.MeshBasicMaterial({ color: options.colors.sticks });
      const stick = new THREE.Mesh(stickGeometry, stickMaterial);
      
      const side = Math.random() > 0.5 ? 1 : -1;
      stick.position.set(
        side * (options.roadWidth / 2 + 1),
        1,
        (Math.random() - 0.5) * options.length
      );
      
      lightSticks.push(stick);
      scene.add(stick);
    }

    // Create car lights
    const carLights: THREE.Mesh[] = [];
    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      // Left side cars (moving away - red lights)
      const leftLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ 
          color: (options.colors.leftCars && options.colors.leftCars.length > 0
            ? options.colors.leftCars[Math.floor(Math.random() * options.colors.leftCars.length)]
            : 0xff0000),
          transparent: true,
          opacity: 0.8
        })
      );
      leftLight.position.set(
        -options.roadWidth / 4,
        0.5,
        (Math.random() - 0.5) * options.length
      );
      carLights.push(leftLight);
      scene.add(leftLight);

      // Right side cars (moving closer - blue/white lights)
      const rightLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ 
          color: (options.colors.rightCars && options.colors.rightCars.length > 0
            ? options.colors.rightCars[Math.floor(Math.random() * options.colors.rightCars.length)]
            : 0xffffff),
          transparent: true,
          opacity: 0.8
        })
      );
      rightLight.position.set(
        options.roadWidth / 4,
        0.5,
        (Math.random() - 0.5) * options.length
      );
      carLights.push(rightLight);
      scene.add(rightLight);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Move car lights
      carLights.forEach((light, index) => {
        if (index % 2 === 0) {
          // Left side cars moving away
          light.position.z += 0.5;
          if (light.position.z > options.length / 2) {
            light.position.z = -options.length / 2;
          }
        } else {
          // Right side cars moving closer
          light.position.z -= 0.8;
          if (light.position.z < -options.length / 2) {
            light.position.z = options.length / 2;
          }
        }
      });

      // Move light sticks
      lightSticks.forEach(stick => {
        stick.position.z -= 0.3;
        if (stick.position.z < -options.length / 2) {
          stick.position.z = options.length / 2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [effectOptions]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

export default Hyperspeed;
