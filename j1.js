
            var Vectors = [];
            var objects = [];
            var objectsBB = [];
            var intersectedPoint = [];
            var ParticlesArr = [];
            var ParticleStep = 0.5;
            var ParticleFlux = [];
            var m = true;
            var v = true;

            var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
            camera.position.z = 5;
            scene.background = new THREE.Color('rgb(192,214,228)');
             
			var renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );
            
            var controls = new THREE.OrbitControls( camera, renderer.domElement );

            var axesHelper = new THREE.AxesHelper( 0.5 );
            scene.add( axesHelper );

            var geometry = new THREE.SphereGeometry( 1, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
            var sphere = new THREE.Mesh( geometry, material );
            scene.add( sphere );
            sphere.position.y -= 0.8;
            sphere.position.z += 2;
            sphere.position.x -= 0.5;
            objects.push(sphere);
            var bb = new THREE.Box3().setFromObject(sphere);
            objectsBB.push(bb);
            

            var raycaster = new THREE.Raycaster();
            var RayOrigin = new THREE.Vector3(  0, 0, 0 );
            var dir = new THREE.Vector3(  0, 0, 1 );
            dir.normalize()
            raycaster.set(RayOrigin, dir);
            var RayLine = new THREE.Vector3(  0, 0, 1 );


            var dotGeometry = new THREE.Geometry();
            dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
            var dotMaterial = new THREE.PointsMaterial( { size: 10, sizeAttenuation: false } );
            var dot = new THREE.Points( dotGeometry, dotMaterial );
            scene.add( dot );

            //EMMITER ---------------------

            var widthEmitter = 3;
            var heightEmitter = 3;

            var geometry = new THREE.PlaneGeometry( widthEmitter, heightEmitter, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0x40ff01, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
            var emitter = new THREE.Mesh( geometry, material );
            scene.add( emitter);
            
            emitterBB = new THREE.Box3().setFromObject(emitter);
            

            

			var animate = function () {
				requestAnimationFrame( animate );

                
                controls.update();
                GenerateTunel();
                
                
            
				renderer.render( scene, camera );
			};

            animate();

            function DtoR(n){
                var r = n * Math.PI / 180;
                return r;
            }

            function RtoD(n){
                var d = n * 180/Math.PI;
                return d;
            }

            function GenerateTunel(){
                
                 if(m){

                    CollisionPoint(RayOrigin); 
                     m = false;
                 }


            }


            function CollisionPoint(p){
                var InterPoint = null;
                
                raycaster.set(p, new THREE.Vector3( 0, 0, 1));

                var intersects = raycaster.intersectObjects( objects );
                
                for ( var i = 0; i < intersects.length; i++ ) {
                    
                    InterPoint = intersects[ i ].point;

                    
                   
                   
                }
                if(m){
                    setupParticle(InterPoint);
                    
                 }
                
            }

            function setupParticle(InterPoint){
                

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(255, 255, 255)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    RayOrigin,
                    InterPoint
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var VerticalVect = createVerticalVector();
                var HorizontalVect = createHorizontalVector();
                    
                var angleVertical = RayLine.angleTo(VerticalVect.vector);
                var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);
                
               
                console.log("horizontal",RtoD(angleHorizontal));
                console.log("vertical",RtoD(angleVertical));


                var vtemp = new THREE.Vector3();
                var vtemp1 = new THREE.Vector3();
                if(RtoD(angleHorizontal) > 90){
                    
                    vtemp.copy(HorizontalVect.final).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: HorizontalVect.final, vector: vtemp};
                }else if(RtoD(angleHorizontal) < 90){
                   
                    vtemp.copy(HorizontalVect.origin).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: HorizontalVect.origin, vector: vtemp};
                }else{
                    vtemp.copy(RayOrigin).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: RayOrigin, vector: vtemp};
                }

                if(RtoD(angleVertical) > 90){
                    
                    vtemp1.copy(VerticalVect.final).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: VerticalVect.final, vector: vtemp1};
                }else if(RtoD(angleVertical ) < 90){
                   
                    vtemp1.copy(VerticalVect.origin).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: VerticalVect.origin, vector: vtemp1};
                }else{
                    vtemp1.copy(RayOrigin).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: RayOrigin, vector: vtemp1};
                }

                var angleVertical = RayLine.angleTo(VerticalVect.vector);
                var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(255, 20, 80)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    HorizontalVect.final,
                    HorizontalVect.origin
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(255, 20, 80)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    VerticalVect.final,
                    VerticalVect.origin
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var VectorResultant = createResultant(HorizontalVect, angleHorizontal, VerticalVect, angleVertical, InterPoint);


                
                //var PerpendiVectResult = createPerpendicular(VectorResultant);
               
                

                //console.log("partiasee1",RtoD(particle.angleTo(PerpendiVectResult.vector)));
                //var deflect = ReflectVector(particle, PerpendiVectResult, InterPoint, VectorResultant);

           

                //sphere.visible = false;
                
                
            }

            function VectorSqrt(vec){

                var sqrtVecX = vec.x * vec.x;
                var sqrtVecY = vec.y * vec.y;
                var sqrtVecZ = vec.z * vec.z;

                var vecSqrt = new THREE.Vector3(sqrtVecX, sqrtVecY, sqrtVecZ);

                return vecSqrt;
            }

            function createHorizontalVector(){
                
                var OriginNow = RayOrigin;
                var a = new THREE.Vector3();
                var b = new THREE.Vector3();

                
                for(var i = 0; i< 2; i++){
                    
                    if(i == 0){
                        OriginNow.y = 0;
                        OriginNow.x -= 0.01;
                    }else{
                        OriginNow.x += 0.02;

                    }

                    raycaster.set(OriginNow, new THREE.Vector3(  0, 0, 1 ));

                    var intersects = raycaster.intersectObjects( objects );

                    for ( var j = 0; j < intersects.length; j++ ) {

                        if(i == 0){
                            a = intersects[ j ].point; 
                            
                        }else{
                            b = intersects[ j ].point; 
                        }
                    }
                }

                var vtemp = new THREE.Vector3();
                vtemp.copy(b).sub(a);
                var vector = {origin: a, final: b, vector: vtemp};
                Vectors[0] = vector;

                // var dotGeometry = new THREE.Geometry();
                // dotGeometry.vertices.push(a);
                // var dotMaterial = new THREE.PointsMaterial( { color: 0x471201,size: 10, sizeAttenuation: false } );
                // var dot = new THREE.Points( dotGeometry, dotMaterial );
                // scene.add( dot );
                // var dotGeometry = new THREE.Geometry();
                // dotGeometry.vertices.push(b);
                // var dotMaterial = new THREE.PointsMaterial( { color: 0x471201,size: 10, sizeAttenuation: false } );
                // var dot = new THREE.Points( dotGeometry, dotMaterial );
                // scene.add( dot );
               
                
                return vector;

            }

            function createVerticalVector(){
                
                var OriginNow = RayOrigin;
                
                var a = new THREE.Vector3();
                var b = new THREE.Vector3();


                for(var i = 0; i< 2; i++){

                    if(i == 0){
                        OriginNow.y -= 0.01;
                    }else{
                        OriginNow.y += 0.02;

                    }

                    raycaster.set(OriginNow, dir);

                    var intersects = raycaster.intersectObjects( objects );

                    for ( var j = 0; j < intersects.length; j++ ) {

                        if(i == 0){
                            a = intersects[ j ].point; 
                            
                        }else{
                            b = intersects[ j ].point; 
                        }
                    }
                }
                var vtemp = new THREE.Vector3();
                vtemp.copy(b).sub(a);
                var vector = {origin: a, final: b, vector: vtemp};
                Vectors[1] = vector;

                
                // var dotGeometry = new THREE.Geometry();
                // dotGeometry.vertices.push(a);
                // var dotMaterial = new THREE.PointsMaterial( { color: 0x407f01, size: 10, sizeAttenuation: false } );
                // var dot = new THREE.Points( dotGeometry, dotMaterial );
                // scene.add( dot );

                
                // var dotGeometry = new THREE.Geometry();
                // dotGeometry.vertices.push(b);
                // var dotMaterial = new THREE.PointsMaterial( { color: 0x407f01, size: 10, sizeAttenuation: false } );
                // var dot = new THREE.Points( dotGeometry, dotMaterial );
                // scene.add( dot );
                
                 
                return vector;
                
            }

            function createResultant(v1, a1, v2, a2, InterPoint){
                var vH = v1; 
                var vV = v2; 

                var a11 = DtoR(80);
                var a21 = DtoR(80);

                var particula = new THREE.Vector3();
                particula.copy(InterPoint).sub(RayOrigin);
               
                
                var CatetoAdjacenteNORMALHorizontal = (particula.length() * Math.cos( DtoR(90) - a1));

                var CatetoOpostoHorizontal = (particula.length() * Math.sin( DtoR(90) - a1));

                var horizontalDeflectFinal = new THREE.Vector3();
                horizontalDeflectFinal.copy(InterPoint);

                horizontalDeflectFinal.x -= CatetoOpostoHorizontal;
                horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
                horizontalDeflectFinal.y = 0;

                var horizontalDeflectVector = new THREE.Vector3();
                horizontalDeflectVector.copy(horizontalDeflectFinal).sub(InterPoint);
                
                var CatetoAdjacenteNORMALVertical = (particula.length() * Math.cos( DtoR(90) - a2));

                var CatetoOpostoVertical = (particula.length() * Math.sin( DtoR(90) - a2));

                var verticalDeflectFinal = new THREE.Vector3();
                verticalDeflectFinal.copy(InterPoint);                

                verticalDeflectFinal.z += CatetoOpostoVertical;
                verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical;
                verticalDeflectFinal.x = 0;
                
                var verticalDeflectVector = new THREE.Vector3();
                verticalDeflectVector.copy(verticalDeflectFinal).sub(InterPoint);

                

                var dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push( horizontalDeflectFinal);
                var dotMaterial = new THREE.PointsMaterial( { color: 'rgb(255, 255, 0)', size: 10, sizeAttenuation: false } );
                var dot = new THREE.Points( dotGeometry, dotMaterial );
                scene.add( dot );

                var dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(verticalDeflectFinal);
                var dotMaterial = new THREE.PointsMaterial( { color: 'rgb(255, 20, 80)', size: 10, sizeAttenuation: false } );
                var dot = new THREE.Points( dotGeometry, dotMaterial );
                scene.add( dot );

                

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(255, 255, 0)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    InterPoint,
                    horizontalDeflectFinal
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(255, 20, 80)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    InterPoint,
                    verticalDeflectFinal
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var ResultantFinal = new THREE.Vector3();
                ResultantFinal.copy(horizontalDeflectFinal).add(verticalDeflectFinal);

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(125, 0, 30)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    InterPoint,
                    ResultantFinal
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var Resultant = {vector1: v1, vector2: v2, origin:v2.origin, final: 0, vector: 0};

                return Resultant;
            }

            function createPerpendicular(v){
                var Vtemp = v;

                var vZ = ((Vtemp.vector.x) + (Vtemp.vector.y))/Vtemp.vector.z;

                var Vtot = new THREE.Vector3(5,5,vZ);
                var Pfinal = new THREE.Vector3();
                Pfinal.copy(Vtot).add(Vtemp.origin);

                var vP = new THREE.Vector3();
                vP.copy(Pfinal).sub(Vtemp.origin);

                var Vperpend = {origin: Vtemp.origin, final: Pfinal, vector: vP};

                var dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(Pfinal);
                var dotMaterial = new THREE.PointsMaterial( { color:'rgb(0,255,0)', size: 10, sizeAttenuation: false } );
                var dot = new THREE.Points( dotGeometry, dotMaterial );
                scene.add( dot );

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(0,255,0)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    Pfinal,
                    Vtemp.origin
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                return Vperpend;

            }

            function ReflectVector(v, n, InterPoint, VectorResultant){
                
                var angleZ = VectorResultant.vector.angleTo(new THREE.Vector3(0,0,1));
                var angleY = VectorResultant.vector.angleTo(new THREE.Vector3(0,1,0));
                var angleX = VectorResultant.vector.angleTo(new THREE.Vector3(1,0,0));

                var angleWithN = v.angleTo(n.vector);
                console.log("anlge", RtoD(angleWithN));





                // var dot = new THREE.Vector3();
                // dot.copy(v).dot(n.vector);
                // var times2 = new THREE.Vector3();
                // times2.copy(dot).multiplyScalar(2);
                // var timesN = new THREE.Vector3();
                // timesN.copy(times2).multiply(n.vector);
                // var r = new THREE.Vector3();
                // r.copy(v).sub(timesN);

                // var rFinal = new THREE.Vector3();
                // rFinal.copy(r).add(InterPoint);

                

                // var vector = {origin: InterPoint, final: rFinal, vector: r};

                // var dotGeometry = new THREE.Geometry();
                // dotGeometry.vertices.push(rFinal);
                // var dotMaterial = new THREE.PointsMaterial( { color:'rgb(255,0,0)', size: 10, sizeAttenuation: false } );
                // var dot = new THREE.Points( dotGeometry, dotMaterial );
                // scene.add( dot );

                // var material = new THREE.LineBasicMaterial({
                //     color:  'rgb(255,0,0)'
                // });
                
                // var geometry = new THREE.Geometry();
                // geometry.vertices.push(
                //     InterPoint,
                //     rFinal
                // );
                
                // var line = new THREE.Line( geometry, material );
                // scene.add( line );





                //return vector;
            }
            
            // function createResultant(v1, v2, InterPoint){
            //     var vH = v1; 
            //     var vV = v2; 

            //     var r = new THREE.Vector3();
              
            //     var r = new THREE.Vector3(vH.final.x , vV.final.y ,  (vH.final.z + vV.final.z));

            //     var pCloning = new THREE.Vector3();
            //     pCloning.copy(r).sub(InterPoint);

            //     var Resultant = {vector1: v1, vector2: v2, origin:v2.origin, final: r, vector: pCloning};

            //     var dotGeometry = new THREE.Geometry();
            //     dotGeometry.vertices.push(r);
            //     var dotMaterial = new THREE.PointsMaterial( { color: 'rgb(255, 255, 0)', size: 10, sizeAttenuation: false } );
            //     var dot = new THREE.Points( dotGeometry, dotMaterial );
            //     scene.add( dot );

                

            //     var material = new THREE.LineBasicMaterial({
            //         color:  'rgb(255, 255, 0)'
            //     });
                
            //     var geometry = new THREE.Geometry();
            //     geometry.vertices.push(
            //         InterPoint,
            //         r
            //     );
                
            //     var line = new THREE.Line( geometry, material );
            //     scene.add( line );


            //     return Resultant;
            // }