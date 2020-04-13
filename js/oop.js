// OOP pseudo code for the CDA app *************************
// 1. create an object for a field, when selected
//  - push to an array called fieldList
//  - have a method to calculate sed, nito, phos loads

// 2. create an object for field list
//  - use the fieldList array
//  - use that object to render both the field selected list
//  - in the main section and in the bmp section

// 3. create a bmp object that
//  - this would be the seleceted bmp's for each field
//  - renders the bmp dropdown list
//  - renders the bmp input boxes
//  - handles the validtaion of the input boxes,
//  - also handles the validation on when a user wants to select an alternate/more than one scenario
//  - and stores the value when a bmp is seleceted
//  - when a user clicks add new BMP allow the bmp in

// 4. create an object for the checkboxes on main page
//  - handle the state
//  - handle the code for rendering.
//  - when needing to use those values, return the property with object notation
//   * consider using getters and setters for the properties of checkbox object

// 5. consider building an object just for HTML rendering that can be used over and over
// 6. create an object called app, this is where we can init our other classes that need to render at runtime

// app run through ******************************
// when the app loads user sees the main screen
// - user can select what loads the want to calculate via - radio button (Phos, Nit, Sed)
//    * if the user chooses sed there are two additional options
// - user can select delivery method - radio button
// - user can select comparison type - radio button *** we may not need this, see &&& below
// - after making all selections and selecting fields the user can click a button called 'select bmp's'
// - the user would then see a new section of the app where each field is dispalyed showing loads
//  * each field box will also contain a BMP dropdown menu
//  * the user can select a BMP
//  * each BMP will have the ability to change the efficiencies,
//    * some BMP's can change 5 inputs
//    * when an input is changed that data needs to be written back to the BMP or Field object
//  * &&& - the user can then click a button to add another scenario, this may replace the comparison type radio buttons
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// class sytax
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.price2 = this.price * 3;
  }

  set priceUpdate(price) {
    this.price = price;
    this.price2 = price * 3;
  }
  get priceTotal() {
    return this.price + this.price2;
  }

  aMethod() {
    this.priceUpdate = 99;
    console.log("method call", this.name);
  }
}

// create a new object
const pillow = new Product(54, "Pillow", 19.95);
console.log(pillow);
console.log(pillow.priceTotal);

pillow.aMethod(); // call a method
console.log(pillow.priceTotal);

class ProductList {
  constructor() {
    this.productList = [];
  }

  updateProductList() {
    console.log("update product list method call");
  }
}
// // test area for learning oop
// console.log("hey OOP");

// // define object with constructor function ********************
// function Circle(radius) {
//   this.radius = radius;
//   this.draw = function () {
//     console.log("draw circle");
//   };
// }
// const circle = new Circle(2.345);
// console.log(circle);
// circle.draw();

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
