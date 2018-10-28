
            var Vectors = [];
            var objects = [];
            var objectsBB = [];
            var endObject = [];
            var intersectedPoint = [];
            var ParticlesArr = [];
            var ParticleFlux = [];
            var m = true;
            var v = true;
            var ParticleStep = 0.5;
            var FluxStep = 0.1;


            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
            camera.rotation.y = -Math.PI/2 - DtoR(45);
            camera.position.x = 5;
            camera.position.y = 2;
            camera.position.z = -2;
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
            //sphere.position.y -= 0.9;
            sphere.position.z += 2;
            //sphere.position.x += 0.2;
            objects.push(sphere);
            var bb = new THREE.Box3().setFromObject(sphere);
            objectsBB.push(bb);
            

            var raycaster = new THREE.Raycaster();
            var RayOrigin = new THREE.Vector3(  0.5, 0, 0 );
            var dir = new THREE.Vector3(  0, 0, 1 );
            dir.normalize()
            raycaster.set(RayOrigin, dir);
            var RayLine = new THREE.Vector3(  0, 0, 1 );


            var dotGeometry = new THREE.Geometry();
            dotGeometry.vertices.push(RayOrigin);
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
            emitter.rotation = new THREE.Vector3(0,0,0);
            
            
            var geometry = new THREE.PlaneGeometry( widthEmitter +1, heightEmitter +1, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0x40ff01, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
            var endReceiver = new THREE.Mesh( geometry, material );
            scene.add( endReceiver);
            endReceiver.position.z = 100;
            
            endObject.push(endReceiver);

            var initalPos = new THREE.Vector3(-widthEmitter/2, heightEmitter/2, 0);
            //RayOrigin.copy(initalPos);

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
                    
                //     if(RayOrigin.x <= widthEmitter/2 && RayOrigin.y  >= -heightEmitter/2  ){
                         CollisionPoint(RayOrigin); 
                //     }
                //     if(RayOrigin.x > widthEmitter/2){
                //         RayOrigin.x = -widthEmitter/2;
                //         RayOrigin.y -= FluxStep;
                //     }
                //     if(RayOrigin.y < -heightEmitter/2){
                //         
                //     }else{
                //         RayOrigin.x += FluxStep;
                //     }
                     m = false;
                  }
                
                
            }


            function CollisionPoint(p){
                var InterPoint = null;
                
                raycaster.set(p, new THREE.Vector3( 0, 0, 1));

                var intersects = raycaster.intersectObjects( objects );
                var notIntersect = raycaster.intersectObjects( endObject);
                
                if(intersects.length > 0){
                    for ( var i = 0; i < intersects.length; i++ ) {
                    
                        InterPoint = intersects[ i ].point;
    
                    }
                    var particle = setupParticle(InterPoint);
                    ParticlesArr.push(particle);
                }else{
                    for ( var i = 0; i < notIntersect.length; i++ ) {
                    var points1 = [RayOrigin, notIntersect[ i ].point ];
                    
                    var line = new THREE.Line( geometry, material );
                    scene.add( line );

                    var material = new THREE.LineBasicMaterial({
                        color:  'rgb(255, 0, 0)'
                    });
                    
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(
                        RayOrigin,
                        notIntersect[ i ].point
                    );
                    
                    var line = new THREE.Line( geometry, material );
                    //scene.add( line );

                    var particle = {line: line, points: points1};
                    ParticlesArr.push(particle);
                    }
                }
                return;
                
            }

            function setupParticle(InterPoint){
                var inv;

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
                
               
                console.log("horizontal dir",RtoD(angleHorizontal));
                console.log("vertical dir",RtoD(angleVertical));


                var vtemp = new THREE.Vector3();
                var vtemp1 = new THREE.Vector3();
                if(RtoD(angleHorizontal) > 45){
                    
                    vtemp.copy(HorizontalVect.final).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: HorizontalVect.final, vector: vtemp};
                    
                }else if(RtoD(angleHorizontal) < 45){
                   
                    vtemp.copy(HorizontalVect.origin).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: HorizontalVect.origin, vector: vtemp};
                    var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);
                    
                }else if(RtoD(angleHorizontal) == 90){
                    vtemp.copy(RayOrigin).sub(InterPoint);
                    HorizontalVect = {origin: InterPoint, final: RayOrigin, vector: vtemp};
                }

                if(RtoD(angleVertical) > 45){
                    
                    vtemp1.copy(VerticalVect.final).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: VerticalVect.final, vector: vtemp1};
                    var angleVertical = RayLine.angleTo(VerticalVect.vector);
                }else if(RtoD(angleVertical ) < 45){
                   
                    vtemp1.copy(VerticalVect.origin).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: VerticalVect.origin, vector: vtemp1};
                    
                }else if(RtoD(angleVertical) == 90){
                    vtemp1.copy(RayOrigin).sub(InterPoint);
                    VerticalVect = {origin: InterPoint, final: RayOrigin, vector: vtemp1};
                }

                var VectorResultant = createResultant(HorizontalVect, angleHorizontal, VerticalVect, angleVertical, InterPoint, inv);


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
                
                var OriginNow = new THREE.Vector3();
                OriginNow.copy(RayOrigin);
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

                return vector;

            }

            function createVerticalVector(){
                
                var OriginNow = new THREE.Vector3();
                OriginNow.copy(RayOrigin);
                
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

                return vector;
                
            }

            function createResultant(v1, aH, v2, aV, InterPoint, inv){
                var vH = v1; 
                var vV = v2;
                var a1 = aH;
                var a2 = aV;
                // var a1 = Math.round(aH);
                // var a2 = Math.round(aV);
                var particula = new THREE.Vector3();
                particula.copy(InterPoint).sub(RayOrigin);
               
                
                var CatetoAdjacenteNORMALHorizontal = (particula.length() * Math.cos( DtoR(90) - a1));

                var CatetoOpostoHorizontal = (particula.length() * Math.sin( DtoR(90) - a1));
                
                var horizontalDeflectFinal = new THREE.Vector3();
                horizontalDeflectFinal.copy(InterPoint);

                console.log("angulo: DtoR(90) - a1", RtoD(DtoR(90) - a1));
                if(( DtoR(90) - a1) > 0){
                    horizontalDeflectFinal.x += CatetoOpostoHorizontal / ParticleStep;
                    horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal / ParticleStep;
                    console.log("esse");
                }else if(( DtoR(90) - a1) < 0){
                    if(RayOrigin.x > 0){
                        console.log("esse1");
                        horizontalDeflectFinal.x -= CatetoOpostoHorizontal / ParticleStep;
                        horizontalDeflectFinal.z += CatetoAdjacenteNORMALHorizontal / ParticleStep;
                    }else{
                        console.log("esse12");
                        horizontalDeflectFinal.x += CatetoOpostoHorizontal / ParticleStep;
                        horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal / ParticleStep;
                    }
                }else{
                    horizontalDeflectFinal.x = InterPoint.x;
                    horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal / ParticleStep;
                }
                
                horizontalDeflectFinal.y = RayOrigin.y;

                var horizontalDeflectVector = new THREE.Vector3();
                horizontalDeflectVector.copy(horizontalDeflectFinal).sub(InterPoint);

                //---------------------------------------------------
                
                var CatetoAdjacenteNORMALVertical = (particula.length() * Math.cos( DtoR(90) - a2));

                var CatetoOpostoVertical = (particula.length() * Math.sin( DtoR(90) - a2));
                console.log("angulo vertical:  a2", RtoD(DtoR(90) - a2));
                var verticalDeflectFinal = new THREE.Vector3();
                verticalDeflectFinal.copy(InterPoint);                

                if(( DtoR(90) - a2) > 0){
                    verticalDeflectFinal.z += CatetoOpostoVertical / ParticleStep;
                    verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical / ParticleStep;
                    console.log("esseV");
                }else if(( DtoR(90) - a2) < 0){
                    if(RayOrigin.x > 0){
                        verticalDeflectFinal.z -= CatetoOpostoVertical / ParticleStep;
                        verticalDeflectFinal.y -=CatetoAdjacenteNORMALVertical/ ParticleStep;
                        console.log("esseV1");
                    }else{
                        console.log("esseV12");
                        verticalDeflectFinal.z -= CatetoOpostoVertical / ParticleStep;
                        verticalDeflectFinal.y -= CatetoAdjacenteNORMALVertical / ParticleStep;
                    }
                }else{
                    verticalDeflectFinal.z = InterPoint.z;
                    verticalDeflectFinal.y = InterPoint.y;
                }
                verticalDeflectFinal.x = RayOrigin.x;
                
                var verticalDeflectVector = new THREE.Vector3();
                verticalDeflectVector.copy(verticalDeflectFinal).sub(InterPoint);

                //---------------------------------------------------------

                var ResultantFinal = new THREE.Vector3();
                ResultantFinal.copy(horizontalDeflectFinal).add(verticalDeflectFinal);

                var material = new THREE.LineBasicMaterial({
                    color:  'rgb(125, 0, 30)'
                });
                
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    RayOrigin,
                    InterPoint,
                    ResultantFinal
                );
                
                var line = new THREE.Line( geometry, material );
                scene.add( line );

                var points1 = [RayOrigin, InterPoint, ResultantFinal];
                var Resultant = {line: line, points: points1};

                return Resultant;
            }

            