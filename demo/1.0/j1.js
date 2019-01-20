var Vectors = [];
var objects = [];
var objectsBB = [];
var endObject = [];
var intersectedPoint = [];
var ParticlesArr = [];
var ParticleMesh = [];
var firstF = false;
var nextF = 0;
var pressureV = 0;

var koko = false;

var step = 8;
var FluxStep = 0.1;

var normals = [];
var normal = [];

var scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(80,80,80)");
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.rotation.y = -Math.PI;
camera.position.z = -2;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var axesHelper = new THREE.AxesHelper(0.5);
scene.add(axesHelper);

// var geometry = new THREE.CubeGeometry(0.01, 1, 1);
// //var geometry = new THREE.SphereGeometry(1, 32, 32);
// var material = new THREE.MeshBasicMaterial({
//   color: new THREE.Color(63, 63, 63)
// });
// var sphere = new THREE.Mesh(geometry, material);
// scene.add(sphere);
// sphere.position.z += 2;
// objects.push(sphere);

var raycaster = new THREE.Raycaster();
var RayOrigin = new THREE.Vector3(00, 0, 0);
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

emitterBB = new THREE.Box3().setFromObject(emitter);

var geometry = new THREE.PlaneGeometry(widthEmitter + 1, heightEmitter + 1, 32);
var material = new THREE.MeshBasicMaterial({
  color: 0x40ff01,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0
});
var endReceiver = new THREE.Mesh(geometry, material);
scene.add(endReceiver);
endReceiver.position.z = 100;

endObject.push(endReceiver);

var initalPos = new THREE.Vector3(-widthEmitter / 2, heightEmitter / 2, 0);
RayOrigin.copy(initalPos);

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
    if (RayOrigin.x <= widthEmitter / 2 && RayOrigin.y >= -heightEmitter / 2) {
      CollisionPoint(RayOrigin);
    }
    if (RayOrigin.x > widthEmitter / 2) {
      RayOrigin.x = -widthEmitter / 2;
      RayOrigin.y -= FluxStep;
    }
    if (RayOrigin.y < -heightEmitter / 2) {
      firstF = false;
      koko = true;
    } else {
      RayOrigin.x += FluxStep;
    }
  } else if (koko) {
    if (nextF != 50) {
      //console.log(ParticlesArr);
      nextFlow();
      nextF++;
    } else if (pressureV != 1) {
      pressureVerification();
      pressureV++;
    }
  }
}

function CollisionPoint(p) {
  var InterPoint = null;

  raycaster.set(p, new THREE.Vector3(0, 0, 1));

  var intersects = raycaster.intersectObjects(objects);
  var notIntersect = raycaster.intersectObjects(endObject);

  if (intersects.length > 0) {
    InterPoint = intersects[0].point;
    setupParticle(InterPoint);
    console.log("colidiu");
  } else {
    console.log("n colidiu");
    let origin = new THREE.Vector3();
    origin.copy(RayOrigin);
    var points1 = [origin, notIntersect[0].point];

    var line = new THREE.Line(geometry, material);
    scene.add(line);

    var material = new THREE.LineBasicMaterial({
      color: "rgb(0, 255, 0)"
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(RayOrigin, notIntersect[0].point);

    geometry.colors = [new THREE.Color(0, 255, 0), new THREE.Color(255, 0, 0)];

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
  return;
}

function setupParticle(InterPoint) {
  var inv;

  var VerticalVect = createVerticalVector();
  var HorizontalVect = createHorizontalVector();

  var angleVertical = RayLine.angleTo(VerticalVect.vector);
  var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);

  var vtemp = new THREE.Vector3();
  var vtemp1 = new THREE.Vector3();
  if (RtoD(angleHorizontal) > 45) {
    vtemp.copy(HorizontalVect.final).sub(InterPoint);
    HorizontalVect = {
      origin: InterPoint,
      final: HorizontalVect.final,
      vector: vtemp
    };
  } else if (RtoD(angleHorizontal) < 45) {
    vtemp.copy(HorizontalVect.origin).sub(InterPoint);
    HorizontalVect = {
      origin: InterPoint,
      final: HorizontalVect.origin,
      vector: vtemp
    };
    var angleHorizontal = RayLine.angleTo(HorizontalVect.vector);
  } else if (RtoD(angleHorizontal) == 90) {
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
  }

  if (RtoD(angleVertical) > 45) {
    vtemp1.copy(VerticalVect.final).sub(InterPoint);
    VerticalVect = {
      origin: InterPoint,
      final: VerticalVect.final,
      vector: vtemp1
    };
    var angleVertical = RayLine.angleTo(VerticalVect.vector);
  } else if (RtoD(angleVertical) < 45) {
    vtemp1.copy(VerticalVect.origin).sub(InterPoint);
    VerticalVect = {
      origin: InterPoint,
      final: VerticalVect.origin,
      vector: vtemp1
    };
  } else if (RtoD(angleVertical) == 90) {
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
  //* Math.pow(10, FluxStep * 100)
  let originStep = 0.0001;
  for (var i = 0; i < 2; i++) {
    if (i == 0) {
      OriginNow.y = 0;
      OriginNow.x -= originStep;
    } else {
      OriginNow.x += originStep * 2;
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
  let originStep = 0.0001;
  for (var i = 0; i < 2; i++) {
    if (i == 0) {
      OriginNow.y -= originStep;
    } else {
      OriginNow.y += originStep * 2;
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
    horizontalDeflectFinal.x += CatetoOpostoHorizontal;
    horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
  } else {
    if (RayOrigin.x > 0) {
      horizontalDeflectFinal.x -= CatetoOpostoHorizontal;
      horizontalDeflectFinal.z -= CatetoAdjacenteNORMALHorizontal;
    } else {
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
  if (otherAngle > 0) {
    verticalDeflectFinal.z += CatetoOpostoVertical;
    verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical;
  } else {
    if (RayOrigin.y > 0) {
      verticalDeflectFinal.z -= CatetoOpostoVertical;
      verticalDeflectFinal.y += CatetoAdjacenteNORMALVertical;
    } else {
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

  var initialPoint = new THREE.Vector3();
  initialPoint.copy(RayOrigin);

  var geometry = new THREE.Geometry();
  //geometry.vertices.push(InterPoint, FinalPoint);
  geometry.vertices.push(initialPoint, InterPoint, FinalPoint);
  geometry.colors = [new THREE.Color(0, 255, 0), new THREE.Color(255, 0, 0)];
  var line = new THREE.Line(geometry, material);
  scene.add(line);

  //var points1 = [InterPoint, FinalPoint];
  var points1 = [initialPoint, InterPoint, FinalPoint];

  var pressurePoints = [];
  pressurePoints.push("N");
  pressurePoints.push("N");

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
  for (let i = 0; i < ParticlesArr.length; i++) {
    CollisionResult(ParticlesArr[i]);
  }
}

function CollisionResult(par) {
  if (par.hitobject != false) {
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
          let material = new THREE.LineBasicMaterial({
            color: "rgb(125, 0, 30)"
          });
          let geometry = new THREE.Geometry();
          for (let b = 0; b < par.points.length; b++) {
            geometry.vertices.push(par.points[b]);
          }
          geometry.colors = [
            new THREE.Color(0, 255, 0),
            new THREE.Color(255, 0, 0)
          ];
          let line = new THREE.Line(geometry, material);

          scene.add(line);
          par.line = line;
        } else {
          par.dir = ResultantNormalized;
          par.points.push(FinalPoint);
          par.final = FinalPoint;

          scene.remove(par.line);
          let material = new THREE.LineBasicMaterial({
            color: "rgb(125, 0, 30)"
          });
          let geometry = new THREE.Geometry();
          for (let b = 0; b < par.points.length; b++) {
            geometry.vertices.push(par.points[b]);
          }
          geometry.colors = [
            new THREE.Color(0, 255, 0),
            new THREE.Color(255, 0, 0)
          ];
          let line = new THREE.Line(geometry, material);
          scene.add(line);
          par.line = line;
        }
      }
    } else {
      par.dir = ResultantNormalized;
      par.points.push(FinalPoint);
      par.final = FinalPoint;

      scene.remove(par.line);
      let material = new THREE.LineBasicMaterial({
        color: "rgb(125, 0, 30)"
      });
      let geometry = new THREE.Geometry();
      for (let b = 0; b < par.points.length; b++) {
        geometry.vertices.push(par.points[b]);
      }
      geometry.colors = [
        new THREE.Color(0, 255, 0),
        new THREE.Color(255, 0, 0)
      ];
      let line = new THREE.Line(geometry, material);
      scene.add(line);
      par.line = line;
    }
  }
}

function pressureVerification() {
  let pointOfAnalysis = new THREE.Vector3();
  let nextPoint = new THREE.Vector3();
  let particleDir = new THREE.Vector3();
  let normalFinal = new THREE.Vector3();

  let pointsObj = [];
  let distances = [];

  for (let i = 0; i < ParticlesArr.length; i++) {
    for (let j = 2; j < ParticlesArr[i].points.length; j++) {
      let currentPoint = new THREE.Vector3();
      currentPoint.copy(ParticlesArr[i].points[j]);

      if (i == 186 && j == 14) {
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(currentPoint);
        var dotMaterial = new THREE.PointsMaterial({
          color: "rgb(60,60,60)",
          size: 3,
          sizeAttenuation: false
        });
        var dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);
      }

      for (let k = 0; k < ParticlesArr.length; k++) {
        for (let t = 2; t < ParticlesArr[k].points.length; t++) {
          if (i != k) {
            let temp = new THREE.Vector3();
            temp.copy(ParticlesArr[k].points[t]);

            let crossPow =
              Math.pow(temp.x - currentPoint.x, 2) +
              Math.pow(temp.y - currentPoint.y, 2) +
              Math.pow(temp.z - currentPoint.z, 2);

            if (crossPow < FluxStep) {
              let tempObj = {
                particleIndex: k,
                pointIndex: t
              };
              distances.push(tempObj);

              if (i == 186 && j == 14) {
                var dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(temp);
                var dotMaterial = new THREE.PointsMaterial({
                  size: 3,
                  sizeAttenuation: false
                });
                var dot = new THREE.Points(dotGeometry, dotMaterial);
                scene.add(dot);
              }
            }
          }
        }
      }
      let obj = {
        currentIndex: i,
        currentSubIndex: j,
        arr: distances
      };
      pointsObj.push(obj);

      distances = [];
    }
  }
  console.log(pointsObj);

  for (let i = 0; i < pointsObj.length; i++) {
    let point = pointsObj[i];

    let tam = point.arr.length;

    let r = Math.trunc(tam / 2);
    let g = Math.trunc(2 / tam);
    if (tam == 0) {
      g = 0;
    }

    if (r > g) {
      ParticlesArr[point.currentIndex].pressurePoints[point.currentSubIndex] =
        "H";
    } else if (g > r || g == r) {
      ParticlesArr[point.currentIndex].pressurePoints[point.currentSubIndex] =
        "N";
    }
  }

  for (let i = 0; i < ParticlesArr.length; i++) {
    let geometry = new THREE.Geometry();

    for (let j = 0; j < ParticlesArr[i].points.length; j++) {
      geometry.vertices.push(ParticlesArr[i].points[j]);
    }

    for (let j = 0; j < geometry.vertices.length; j++) {
      if (ParticlesArr[i].pressurePoints[j] === "H") {
        geometry.colors[j] = new THREE.Color(255, 0, 0);
      } else if (ParticlesArr[i].pressurePoints[j] === "N") {
        geometry.colors[j] = new THREE.Color(0, 255, 0);
      }
    }

    let material = new THREE.LineBasicMaterial({
      linewidth: 1,
      color: 0xffffff,
      vertexColors: THREE.VertexColors
    });

    scene.remove(ParticlesArr[i].line);
    let line = new THREE.Line(geometry, material);
    ParticlesArr[i].line = line;

    if (ParticlesArr[i].hitobject == false) {
      line.visible = false;
    }
    scene.add(line);
  }

  // for (let i = 0; i < ParticlesArr.length; i++) {
  //   for (let j = 2; j < ParticlesArr[i].points.length; j++) {
  //     let pointArr = [];
  //     // let distances = [];
  //     let currentPoint = new THREE.Vector3();
  //     currentPoint.copy(ParticlesArr[i].points[j]);

  //     for (let k = 0; k < ParticlesArr.length; k++) {
  //       for (let t = 2; t < ParticlesArr[k].points.length; t++) {
  //         if (i != k) {
  //           let temp = new THREE.Vector3();
  //           temp.copy(ParticlesArr[k].points[t]);

  //           if (currentPoint.distanceTo(temp) < FluxStep) {
  //             let obj = {
  //               particleIndex: k,
  //               pointIndex: t
  //             };
  //             distances.push(obj);
  //           }
  //         }
  //       }
  //       pointArr.push(distances);
  //     }
  //     lineArr.push(pointArr);
  //   }
  //   partiArr.push(lineArr);
  // }
  // console.log(lineArr);
  // let geometry = ParticlesArr[186].line.geometry;
  // for (var j = 0; j < geometry.vertices.length; j++) {
  //   let tam = partiArr[186][186][j];
  //   console.log(j, tam);
  //   //geometry.colors[j] = new THREE.Color(Math.random(), Math.random(), 0);
  // }

  // for (let i = 0; i < ParticlesArr.length; i++) {
  //   let geometry = ParticlesArr[i].line.geometry;

  //   for (var j = 0; j < geometry.vertices.length; j++) {
  //     let tam = partiArr[i][i][j].length;
  //     console.log(i, j, tam);
  //     //geometry.colors[j] = new THREE.Color(Math.random(), Math.random(), 0);
  //   }
  // }

  //   let rotatingVector = new THREE.Vector3();
  //   rotatingVector.copy(normalVector);
  //   for (let k = 0; k < 90; k++) {
  //     let a = DtoR(k);
  //     rotatingVector.x =
  //       rotatingVector.x * Math.cos(a) - rotatingVector.y * Math.sin(a);
  //     rotatingVector.y =
  //       rotatingVector.x * Math.sin(a) + rotatingVector.y * Math.cos(a);

  //     var raycasterPressure = new THREE.Raycaster();
  //     raycasterPressure.set(pointOfAnalysis, rotatingVector);

  //     for (let t = 0; t < ParticlesArr.length; t++) {
  //       let intersectsPressure = raycasterPressure.intersectObject(
  //         ParticlesArr[t].line
  //       );
  //       if (intersectsPressure > 0) {
  //         console.log("cai aqui");
  //       }
  //       // if (intersectsPressure > 0) {
  //       //   console.log("cai aqui");
  //       //   for (let t2 = 0; t2 < 2; t2++) {
  //       //     let crossPow =
  //       //       Math.pow(
  //       //         intersectsPressure[t2].point.x - pointOfAnalysis.x,
  //       //         2
  //       //       ) +
  //       //       Math.pow(
  //       //         intersectsPressure[t2].point.y - pointOfAnalysis.y,
  //       //         2
  //       //       ) +
  //       //       Math.pow(
  //       //         intersectsPressure[t2].point.z - pointOfAnalysis.z,
  //       //         2
  //       //       );

  //       //     if (crossPow < FluxStep) {
  //       //       console.log("dentro");
  //       //     }
  //       //   }
  //       // }
  //     }
  //   }

  //   let crossPow =
  //   Math.pow(projectedPoint.x - center.x, 2) +
  //   Math.pow(projectedPoint.y - center.y, 2) +
  //   Math.pow(projectedPoint.z - center.z, 2);

  // let samePlane =
  //   (projectedPoint.x - center.x) * normalVector.x +
  //   (projectedPoint.y - center.y) * normalVector.y +
  //   (projectedPoint.z - center.z) * normalVector.z;
}
/*------------------------------------------------------------*/

function Start() {
  firstF = true;
  console.log("started");
}

/*---------------------FILE LOADER SYSTEM---------------------*/
function onFileLoad(event) {
  let modelData = event.target.result;

  let objLoader = new THREE.OBJLoader();

  var geometry = objLoader.parse(modelData);
  let pos = new THREE.Vector3(0, 0, 12);

  //scene.add(geometry);
  console.log(geometry);
  if (geometry.children.length > 0) {
    for (let i = 0; i < geometry.children.length; i++) {
      // let obj = new THREE.Mesh();
      // obj.clone(geometry.children[i]);
      // console.log(obj);
      // scene.add(obj);
      let obj = new THREE.Mesh(
        geometry.children[i].geometry,
        geometry.children[i].material
      );
      obj.position.copy(pos);
      scene.add(obj);

      objects.push(obj);
    }
  } else {
    let obj = new THREE.Mesh(geometry.geometry, geometry.material);
    obj.position.copy(pos);
    scene.add(obj);

    objects.push(obj);
  }
}

function onChooseFile(event, onLoadFileHandler) {
  if (typeof window.FileReader !== "function")
    throw "The file API isn't supported on this browser.";
  let input = event.target;
  if (!input) throw "The browser does not properly implement the event object";
  if (!input.files)
    throw "This browser does not support the `files` property of the file input.";
  if (!input.files[0]) return undefined;
  let file = input.files[0];
  let fr = new FileReader();
  fr.onload = onLoadFileHandler;
  fr.readAsText(file);
}
