var Vectors = [];
var objects = [];
var objectsBB = [];
var endObject = [];
var intersectedPoint = [];
var ParticlesArr = [];
var ParticleMesh = [];
var firstF = true;
var nextF = 0;
var pressureV = 0;
var numberOfPoints = 0;

var step = 8;
var FluxStep = 0.1;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.rotation.y = -Math.PI / 2 - DtoR(45);
camera.position.x = 5;
camera.position.y = 2;
camera.position.z = -2;
scene.background = new THREE.Color("rgb(192,214,228)");

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var axesHelper = new THREE.AxesHelper(0.5);
scene.add(axesHelper);
var geometry = new THREE.CubeGeometry(1, 1, 1);
//var geometry = new THREE.SphereGeometry(1, 32, 32);
var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
var sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
//sphere.position.y -= 0.9;
sphere.position.z += 2;
//sphere.position.x += 0.2;
objects.push(sphere);
var bb = new THREE.Box3().setFromObject(sphere);
objectsBB.push(bb);

var raycaster = new THREE.Raycaster();
var RayOrigin = new THREE.Vector3(0.1, -0.2, 0);
var dir = new THREE.Vector3(0, 0, 1);
dir.normalize();
raycaster.set(RayOrigin, dir);
var RayLine = new THREE.Vector3(0, 0, 1);

var dotGeometry = new THREE.Geometry();
dotGeometry.vertices.push(RayOrigin);
var dotMaterial = new THREE.PointsMaterial({
  size: 10,
  sizeAttenuation: false
});
var dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);

//EMMITER ---------------------

var widthEmitter = 3;
var heightEmitter = 3;

var geometry = new THREE.PlaneGeometry(widthEmitter, heightEmitter, 32);
var material = new THREE.MeshBasicMaterial({
  color: 0x40ff01,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5
});
var emitter = new THREE.Mesh(geometry, material);
scene.add(emitter);
emitter.rotation = new THREE.Vector3(0.3, 0, 0);

var geometry = new THREE.PlaneGeometry(widthEmitter + 1, heightEmitter + 1, 32);
var material = new THREE.MeshBasicMaterial({
  color: 0x40ff01,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5
});
var endReceiver = new THREE.Mesh(geometry, material);
scene.add(endReceiver);
endReceiver.position.z = 100;

endObject.push(endReceiver);

var initalPos = new THREE.Vector3(-widthEmitter / 2, heightEmitter / 2, 0);
//RayOrigin.copy(initalPos);

var animate = function() {
  requestAnimationFrame(animate);

  controls.update();
  GenerateTunel();

  renderer.render(scene, camera);
};

animate();

function DtoR(n) {
  var r = (n * Math.PI) / 180;
  return r;
}

function RtoD(n) {
  var d = (n * 180) / Math.PI;
  return d;
}

function GenerateTunel() {
  if (firstF) {
    //     if(RayOrigin.x <= widthEmitter/2 && RayOrigin.y  >= -heightEmitter/2  ){
    CollisionPoint(RayOrigin);

    RayOrigin.x += 0.05;

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
    firstF = false;
  } else if (nextF < 20) {
    nextFlow();
    nextF++;
  } else if (pressureV != 1) {
    pressureVerification();
    pressureV++;
  }
}

function CollisionPoint(p) {
  var InterPoint = null;

  raycaster.set(p, new THREE.Vector3(0, 0, 1));

  var intersects = raycaster.intersectObjects(objects);
  var notIntersect = raycaster.intersectObjects(endObject);

  if (intersects.length > 0) {
    InterPoint = intersects[0].point;
    var particle = setupParticle(InterPoint);
  } else {
    for (var i = 0; i < notIntersect.length; i++) {
      var points1 = [RayOrigin, notIntersect[0].point];

      var line = new THREE.Line(geometry, material);
      scene.add(line);

      var material = new THREE.LineBasicMaterial({
        color: "rgb(0, 255, 0)"
      });

      var geometry = new THREE.Geometry();
      geometry.vertices.push(RayOrigin, notIntersect[0].point);

      var line = new THREE.Line(geometry, material);
      line.visible = false;
      scene.add(line);

      var pressurePoints = [];
      pressurePoints.push("N");
      pressurePoints.push("N");

      var particle = {
        line: line,
        points: points1,
        velocity: 24,
        final: notIntersect[0].point,
        hitobject: false,
        pressurePoints: pressurePoints
      };
      ParticlesArr.push(particle);
    }
  }
  return;
}

function setupParticle(InterPoint) {
  var inv;

  var material = new THREE.LineBasicMaterial({
    color: "rgb(255, 255, 255)"
  });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(RayOrigin, InterPoint);

  var line = new THREE.Line(geometry, material);
  scene.add(line);

  var VerticalVect = createVerticalVector();
  var HorizontalVect = createHorizontalVector();

  var angleVertical = RayLine.angleTo(VerticalVect.vector);
  var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);

  console.log("horizontal dir", RtoD(angleHorizontal));
  console.log("vertical dir", RtoD(angleVertical));

  var vtemp = new THREE.Vector3();
  var vtemp1 = new THREE.Vector3();
  if (RtoD(angleHorizontal) == 90) {
    if (InterPoint.x > 0) {
      vtemp.copy(HorizontalVect.final).sub(InterPoint);
      HorizontalVect = {
        origin: InterPoint,
        final: HorizontalVect.final,
        vector: vtemp
      };
    } else if (InterPoint.x < 0) {
      vtemp.copy(HorizontalVect.origin).sub(InterPoint);
      HorizontalVect = {
        origin: InterPoint,
        final: HorizontalVect.origin,
        vector: vtemp
      };
      var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);
    }
  } else if (RtoD(angleHorizontal) > 45) {
    console.log("horizontal > 45");
    vtemp.copy(HorizontalVect.final).sub(InterPoint);
    HorizontalVect = {
      origin: InterPoint,
      final: HorizontalVect.final,
      vector: vtemp
    };
  } else if (RtoD(angleHorizontal) < 45) {
    console.log("horizontal < 45");
    vtemp.copy(HorizontalVect.origin).sub(InterPoint);
    HorizontalVect = {
      origin: InterPoint,
      final: HorizontalVect.origin,
      vector: vtemp
    };
    var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);
  }

  if (RtoD(angleVertical) == 90) {
    if (InterPoint.y > 0) {
      vtemp1.copy(VerticalVect.final).sub(InterPoint);
      VerticalVect = {
        origin: InterPoint,
        final: VerticalVect.final,
        vector: vtemp1
      };
      var angleVertical = RayLine.angleTo(VerticalVect.vector);
    } else if (InterPoint.y < 0) {
      vtemp1.copy(VerticalVect.origin).sub(InterPoint);
      VerticalVect = {
        origin: InterPoint,
        final: VerticalVect.origin,
        vector: vtemp1
      };
    }
  } else if (RtoD(angleVertical) > 45) {
    console.log("vertical > 45");
    vtemp1.copy(VerticalVect.final).sub(InterPoint);
    VerticalVect = {
      origin: InterPoint,
      final: VerticalVect.final,
      vector: vtemp1
    };
    var angleVertical = RayLine.angleTo(VerticalVect.vector);
  } else if (RtoD(angleVertical) < 45) {
    console.log("vertical < 45");
    vtemp1.copy(VerticalVect.origin).sub(InterPoint);
    VerticalVect = {
      origin: InterPoint,
      final: VerticalVect.origin,
      vector: vtemp1
    };
  }

  createResultant(
    HorizontalVect,
    angleHorizontal,
    VerticalVect,
    angleVertical,
    InterPoint,
    inv
  );

  //sphere.visible = false;
}

function VectorSqrt(vec) {
  var sqrtVecX = vec.x * vec.x;
  var sqrtVecY = vec.y * vec.y;
  var sqrtVecZ = vec.z * vec.z;

  var vecSqrt = new THREE.Vector3(sqrtVecX, sqrtVecY, sqrtVecZ);

  return vecSqrt;
}

function createHorizontalVector() {
  var OriginNow = new THREE.Vector3();
  OriginNow.copy(RayOrigin);
  var a = new THREE.Vector3();
  var b = new THREE.Vector3();

  for (var i = 0; i < 2; i++) {
    if (i == 0) {
      OriginNow.y = 0;
      OriginNow.x -= 0.01;
    } else {
      OriginNow.x += 0.02;
    }

    raycaster.set(OriginNow, new THREE.Vector3(0, 0, 1));

    var intersects = raycaster.intersectObjects(objects);

    for (var j = 0; j < intersects.length; j++) {
      if (i == 0) {
        a = intersects[j].point;
      } else {
        b = intersects[j].point;
      }
    }
  }

  var vtemp = new THREE.Vector3();
  vtemp.copy(b).sub(a);
  var vector = { origin: a, final: b, vector: vtemp };
  Vectors[0] = vector;

  return vector;
}

function createVerticalVector() {
  var OriginNow = new THREE.Vector3();
  OriginNow.copy(RayOrigin);

  var a = new THREE.Vector3();
  var b = new THREE.Vector3();

  for (var i = 0; i < 2; i++) {
    if (i == 0) {
      OriginNow.y -= 0.01;
    } else {
      OriginNow.y += 0.02;
    }

    raycaster.set(OriginNow, dir);

    var intersects = raycaster.intersectObjects(objects);

    for (var j = 0; j < intersects.length; j++) {
      if (i == 0) {
        a = intersects[j].point;
      } else {
        b = intersects[j].point;
      }
    }
  }
  var vtemp = new THREE.Vector3();
  vtemp.copy(b).sub(a);
  var vector = { origin: a, final: b, vector: vtemp };
  Vectors[1] = vector;

  return vector;
}

function createResultant(v1, aH, v2, aV, InterPoint, inv) {
  var vH = v1;
  var vV = v2;
  var a1 = aH.toFixed(2);
  var a2 = aV.toFixed(2);
  // var a1 = Math.round(aH);
  // var a2 = Math.round(aV);
  var particula = new THREE.Vector3();
  particula.copy(InterPoint).sub(RayOrigin);

  var CatetoAdjacenteNORMALHorizontal =
    particula.length() * Math.cos(DtoR(90) - a1);

  var CatetoOpostoHorizontal = particula.length() * Math.sin(DtoR(90) - a1);

  var horizontalDeflectFinal = new THREE.Vector3();
  horizontalDeflectFinal.copy(InterPoint);
  var angleAux1 = DtoR(90) - a1;
  var otherAngle1 = angleAux1.toFixed(2);
  if (otherAngle1 > 0) {
    console.log("horizontal DtoR(90) - a1 > 0");
    horizontalDeflectFinal.x += CatetoOpostoHorizontal;
    horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
  } else {
    if (RayOrigin.x > 0) {
      console.log("horizontal DtoR(90) - a1 > 0 e RayOrigin.x > 0");
      horizontalDeflectFinal.x -= CatetoOpostoHorizontal;
      horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
    } else {
      console.log("horizontal DtoR(90) - a1 > 0 e else");
      horizontalDeflectFinal.x += CatetoOpostoHorizontal;
      horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
    }
  }

  horizontalDeflectFinal.y = RayOrigin.y;

  var horizontalDeflectVector = new THREE.Vector3();
  horizontalDeflectVector.copy(horizontalDeflectFinal).sub(InterPoint);

  //---------------------------------------------------

  var CatetoAdjacenteNORMALVertical =
    particula.length() * Math.cos(DtoR(90) - a2);

  var CatetoOpostoVertical = particula.length() * Math.sin(DtoR(90) - a2);

  var verticalDeflectFinal = new THREE.Vector3();
  verticalDeflectFinal.copy(InterPoint);

  var angleAux = DtoR(90) - a2;
  var otherAngle = angleAux.toFixed(2);
  console.log("aaa", otherAngle);
  if (otherAngle > 0) {
    console.log("vertical DtoR(90) - a1 > 0");
    verticalDeflectFinal.z += CatetoOpostoVertical;
    verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical;
  } else {
    if (RayOrigin.y > 0) {
      console.log("horizontal DtoR(90) - a1 > 0 e RayOrigin.y > 0");
      verticalDeflectFinal.z -= CatetoOpostoVertical;
      verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical;
    } else {
      console.log("horizontal DtoR(90) - a1 > 0 e else");
      verticalDeflectFinal.z -= CatetoOpostoVertical;
      verticalDeflectFinal.y -= CatetoAdjacenteNORMALVertical;
    }
  }
  verticalDeflectFinal.x = RayOrigin.x;

  var verticalDeflectVector = new THREE.Vector3();
  verticalDeflectVector.copy(verticalDeflectFinal).sub(InterPoint);

  //---------------------------------------------------------

  var ResultantFinal = new THREE.Vector3();
  ResultantFinal.copy(horizontalDeflectFinal).add(verticalDeflectFinal);

  var ResultantFinalVector = new THREE.Vector3();
  ResultantFinalVector.copy(ResultantFinal).sub(InterPoint);

  var ResultantNormalized = new THREE.Vector3();
  ResultantNormalized.copy(ResultantFinalVector).normalize();

  var ResultantNormalizedStep = new THREE.Vector3();
  ResultantNormalizedStep.copy(ResultantNormalized).divideScalar(step);

  var FinalPoint = new THREE.Vector3();
  FinalPoint.copy(InterPoint).add(ResultantNormalizedStep);

  var material = new THREE.LineBasicMaterial({
    color: "rgb(125, 0, 30)"
  });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(RayOrigin, InterPoint, FinalPoint);

  var line = new THREE.Line(geometry, material);
  scene.add(line);

  var points1 = [RayOrigin, InterPoint, FinalPoint];

  var pressurePoints = [];
  pressurePoints.push("N");
  pressurePoints.push("H");

  var Resultant = {
    line: line,
    points: points1,
    mass: 1,
    velocity: 24,
    dir: ResultantNormalized,
    vector: ResultantFinalVector,
    final: points1[points1.length - 1],
    pressurePoints: pressurePoints
  };

  var dotGeometry = new THREE.Geometry();
  dotGeometry.vertices.push(FinalPoint);
  var dotMaterial = new THREE.PointsMaterial({
    size: 1,
    sizeAttenuation: false
  });
  var dot = new THREE.Points(dotGeometry, dotMaterial);
  scene.add(dot);

  ParticleMesh.push(dot);
  ParticlesArr.push(Resultant);
}

function nextFlow() {
  for (var i = 0; i < ParticlesArr.length; i++) {
    // var origintemp = new THREE.Vector3(0, 0, 0);
    // if (par) origintemp.copy(ParticlesArr[i].final);
    // origintemp.z = 0;
    // var raya = new THREE.Raycaster();
    // var dir = new THREE.Vector3(0, 0, 1);
    // dir.normalize();
    // raya.set(origintemp, dir);

    // var intersects2 = raya.intersectObjects(ParticleMesh);

    // for (var j = 0; j < intersects2.length; j++) {
    //   if (intersects2.length > 0) {
    CollisionResult(ParticlesArr[i]);
    //     console.log("Ponto", ParticlesArr[0].final);
    //     console.log("achou o ponto", intersects2[j].point);
    //   }
    // }
  }
}

function CollisionResult(par) {
  let force = new THREE.Vector3(0, 0, par.velocity);

  let forcePointFinal = new THREE.Vector3();
  forcePointFinal.copy(force).add(par.final);

  let forceVector = new THREE.Vector3();
  forceVector.copy(forcePointFinal).sub(par.final);

  let vectorVelocity = new THREE.Vector3();
  vectorVelocity.copy(par.dir).multiplyScalar(par.velocity);

  let vectorVelocityFinal = new THREE.Vector3();
  vectorVelocityFinal.copy(vectorVelocity).add(par.final);

  let ResultantFinal = new THREE.Vector3();
  ResultantFinal.copy(vectorVelocityFinal).add(forcePointFinal);

  let ResultantVector = new THREE.Vector3();
  ResultantVector.copy(ResultantFinal).sub(par.final);

  let ResultantNormalized = new THREE.Vector3();
  ResultantNormalized.copy(ResultantVector).normalize();

  let ResultantNormalizedStep = new THREE.Vector3();
  ResultantNormalizedStep.copy(ResultantNormalized);
  ResultantNormalizedStep.divideScalar(step);

  let FinalPoint = new THREE.Vector3();
  FinalPoint.copy(par.final).add(ResultantNormalizedStep);

  let ray = new THREE.Raycaster();
  ray.set(par.final, ResultantNormalized);

  let intersects = ray.intersectObjects(objects);

  if (intersects.length > 0) {
    for (let k = 0; k < intersects.length; k++) {
      par.line.geometry.vertices.push(intersects[k].point);

      let sizeInter = intersects[k].point.distanceTo(par.final);
      let sizeV = FinalPoint.distanceTo(par.final);

      if (sizeInter < sizeV) {
        let surplusVector = new THREE.Vector3();
        surplusVector.copy(FinalPoint).sub(intersects[k].point);

        let catetoOposto = surplusVector.length() * Math.sin(DtoR(30));

        let catetoOpostoFinal = new THREE.Vector3();
        catetoOpostoFinal.copy(FinalPoint);

        catetoOpostoFinal.z -= catetoOposto * 2;

        let newDir = new THREE.Vector3();
        newDir.copy(catetoOpostoFinal).sub(intersects[k].point);

        let normalizeDir = new THREE.Vector3();
        normalizeDir.copy(newDir).normalize();

        par.dir = normalizeDir;
        par.points.push(catetoOpostoFinal);
        par.final = catetoOpostoFinal;

        scene.remove(par.line);
        var material = new THREE.LineBasicMaterial({
          color: "rgb(125, 0, 30)"
        });
        var geometry = new THREE.Geometry();
        for (let b = 0; b < par.points.length; b++) {
          geometry.vertices.push(par.points[b]);
        }
        var line = new THREE.Line(geometry, material);
        scene.add(line);
        par.line = line;
      } else {
        par.dir = ResultantNormalized;
        par.points.push(FinalPoint);
        par.final = FinalPoint;

        scene.remove(par.line);
        var material = new THREE.LineBasicMaterial({
          color: "rgb(125, 0, 30)"
        });
        var geometry = new THREE.Geometry();
        for (let b = 0; b < par.points.length; b++) {
          geometry.vertices.push(par.points[b]);
        }
        var line = new THREE.Line(geometry, material);
        scene.add(line);
        par.line = line;
      }
    }
  } else {
    par.dir = ResultantNormalized;
    par.points.push(FinalPoint);
    par.final = FinalPoint;

    scene.remove(par.line);
    var material = new THREE.LineBasicMaterial({
      color: "rgb(125, 0, 30)"
    });
    var geometry = new THREE.Geometry();
    for (let b = 0; b < par.points.length; b++) {
      geometry.vertices.push(par.points[b]);
    }
    var line = new THREE.Line(geometry, material);
    scene.add(line);
    par.line = line;
  }
}

function pressureVerification() {
  for (let i = 0; i < ParticlesArr.length; i++) {
    for (let j = 2; j < ParticlesArr[i].points.length; j++) {
      console.log("aqui");
      let pointOfAnalysis = new THREE.Vector3();
      let nextPoint = new THREE.Vector3();
      let particleDir = new THREE.Vector3();
      let normalFinal = new THREE.Vector3();

      if (ParticlesArr[i].points[j + 1] != undefined) {
        console.log("aqui2");
        pointOfAnalysis.copy(ParticlesArr[i].points[j]);
        nextPoint.copy(ParticlesArr[i].points[j + 1]);

        particleDir
          .copy(nextPoint)
          .sub(pointOfAnalysis)
          .normalize();

        let z2 = (-particleDir.x - particleDir.y) / particleDir.z;

        let normalVector = new THREE.Vector3(1, 1, z2);
        normalVector.normalize();

        normalFinal.copy(pointOfAnalysis).add(normalVector);

        let center = new THREE.Vector3();
        center.copy(pointOfAnalysis);

        for (let k = 0; k < ParticlesArr.length; k++) {
          for (let t = 2; t < ParticlesArr[k].points.length; t++) {
            console.log("aqui3");
            let p = new THREE.Vector3();
            p.copy(ParticlesArr[k].points[t]);

            let crossPow =
              Math.pow(p.x - center.x, 2) +
              Math.pow(p.y - center.y, 2) +
              Math.pow(p.z - center.z, 2);

            let samePlane =
              (p.x - center.x, 2) * normalVector.x +
              (p.y - center.y, 2) * normalVector.y +
              (p.z - center.z, 2) * normalVector.z;

            if (crossPow <= FluxStep) {
              console.log("dentro do circulo");
            }
            if (samePlane === 0) {
              console.log("dentro do plano");
            }

            if (crossPow <= FluxStep && samePlane === 0) {
              console.log("aqui4");
              numberOfPoints++;
            }
          }
        }
      }
      if (numberOfPoints > 1) {
        ParticlesArr[i].pressurePoints[j] = "Hb";
      }
    }
    numberOfPoints = 0;
    console.log("pressure", ParticlesArr[i].pressurePoints);
  }
}
