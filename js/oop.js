// test area for learning oop
console.log("hey OOP");

// define object with constructor function ********************
function Circle(radius) {
  this.radius = radius;
  this.draw = function () {
    console.log("draw circle");
  };
}
const circle = new Circle(2.345);
console.log(circle);
circle.draw();

// // object literal, simple way to define an object,
// // not a good way because we would duplicate code
// const circle = {
//   radius: 1.5,
//   location: {
//     x: 3,
//     y: 4,
//   },
//   draw: function () {
//     console.log("draw");
//   },
// };
// circle.draw();

// // define object with factory function *********************
// function Circle(radius) {
//   return {
//     radius: radius,
//     draw: function () {
//       console.log("draw");
//     },
//   };
// }

// const cirle1 = new Circle(2.345);
// // console.log(cirle1);
// // cirle1.draw();
