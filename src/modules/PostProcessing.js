/**
 * PostProcessing - Handles screen effects like motion blur
 * Follows C.O.R.E. principles: lightweight, minimal dependencies
 */

import * as THREE from 'three';

export class PostProcessing {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.renderTarget = null;
        this.blurMaterial = null;
        this.screenQuad = null;
        this.blurIntensity = 0;
        this.targetBlurIntensity = 0;
        
        this.init();
    }

    init() {
        // Create render target for post-processing
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat
            }
        );

        // Create motion blur shader material
        this.blurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: this.renderTarget.texture },
                blurIntensity: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float blurIntensity;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = vec4(0.0);
                    float total = 0.0;
                    
                    // Simple motion blur by sampling multiple frames
                    for (float i = -2.0; i <= 2.0; i += 1.0) {
                        float weight = 1.0 - abs(i) / 3.0;
                        vec2 offset = vec2(0.0, i * blurIntensity * 0.01);
                        color += texture2D(tDiffuse, vUv + offset) * weight;
                        total += weight;
                    }
                    
                    gl_FragColor = color / total;
                }
            `
        });

        // Create screen-filling quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.screenQuad = new THREE.Mesh(geometry, this.blurMaterial);
        this.screenQuad.position.z = -1;
    }

    updateBlurIntensity(intensity) {
        this.targetBlurIntensity = intensity;
    }

    render() {
        // Smooth blur intensity transitions
        this.blurIntensity += (this.targetBlurIntensity - this.blurIntensity) * 0.1;
        this.blurMaterial.uniforms.blurIntensity.value = this.blurIntensity;

        // Only apply post-processing if blur is active
        if (this.blurIntensity > 0.01) {
            // Render scene to render target
            this.renderer.setRenderTarget(this.renderTarget);
            this.renderer.render(this.scene, this.camera);
            
            // Render post-processed result to screen
            this.renderer.setRenderTarget(null);
            
            // Create temporary scene for post-processing
            const tempScene = new THREE.Scene();
            const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            tempScene.add(this.screenQuad);
            
            this.renderer.render(tempScene, tempCamera);
        } else {
            // Normal rendering
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize(width, height) {
        this.renderTarget.setSize(width, height);
    }

    dispose() {
        this.renderTarget.dispose();
        this.blurMaterial.dispose();
        this.screenQuad.geometry.dispose();
    }
}
