import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Nat;
    image : Storage.ExternalBlob;
    rating : Float;
  };

  public type Category = {
    id : Nat;
    name : Text;
  };

  public type Review = {
    productId : Nat;
    reviewer : Text;
    rating : Nat;
    comment : Text;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Float;
  };

  public type Order = {
    id : Nat;
    customer : Principal;
    customerName : Text;
    address : Text;
    phone : Text;
    paymentMethod : Text;
    items : [OrderItem];
    total : Float;
    timestamp : Time.Time;

  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let reviews = Map.empty<Nat, [Review]>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextOrderId = 1;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProduct(name : Text, description : Text, price : Float, category : Nat, image : Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      category;
      image;
      rating = 0.0;
    };

    products.add(product.id, product);
    nextProductId += 1;
    product.id;
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, description : Text, price : Float, category : Nat, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let product : Product = {
          id;
          name;
          description;
          price;
          category;
          image;
          rating = 0.0;
        };
        products.add(id, product);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.remove(id);
  };

  public query ({ caller }) func searchProducts(text : Text) : async [Product] {
    let lowercaseQuery = text.toLower();
    products.values().toArray().filter(
      func(product) {
        product.name.toLower().contains(#text lowercaseQuery) or product.description.toLower().contains(#text lowercaseQuery)
      }
    );
  };

  public shared ({ caller }) func createCategory(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let category : Category = {
      id = nextCategoryId;
      name;
    };

    categories.add(category.id, category);
    nextCategoryId += 1;
    category.id;
  };

  public query ({ caller }) func getCategory(id : Nat) : async Category {
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared ({ caller }) func addReview(productId : Nat, reviewer : Text, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };

    let review : Review = {
      productId;
      reviewer;
      rating;
      comment;
    };

    let currentReviews = switch (reviews.get(productId)) {
      case (null) { [] };
      case (?r) { r };
    };

    reviews.add(productId, currentReviews.concat([review]));
    updateProductRating(productId);
  };

  func updateProductRating(productId : Nat) {
    let product = switch (products.get(productId)) {
      case (null) { return };
      case (?p) { p };
    };

    let productReviews = switch (reviews.get(productId)) {
      case (null) { [] };
      case (?r) { r };
    };

    if (productReviews.size() == 0) { return };

    let total = productReviews.foldLeft(0.0, func(acc, r) { acc + r.rating.toFloat() });
    let avg = total / productReviews.size().toFloat();

    let updatedProduct : Product = {
      id = product.id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      image = product.image;
      rating = avg;
    };

    products.add(productId, updatedProduct);
  };

  public query ({ caller }) func getProductReviews(productId : Nat) : async [Review] {
    switch (reviews.get(productId)) {
      case (null) { [] };
      case (?r) { r };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?c) { c };
    };

    let updatedCart = currentCart.concat([{ productId; quantity }]);
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart items");
    };

    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };

    let updatedCart = currentCart.map(
      func(item) {
        if (item.productId == productId) {
          { productId; quantity };
        } else {
          item;
        };
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };

    let updatedCart = currentCart.filter(func(item) { item.productId != productId });

    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    carts.remove(caller);
  };

  public shared ({ caller }) func placeOrder(customerName : Text, address : Text, phone : Text, paymentMethod : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };

    if (cart.size() == 0) { Runtime.trap("Cart is empty") };

    let orderItems = cart.map(
      func(item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?p) { p };
        };
        {
          productId = item.productId;
          quantity = item.quantity;
          price = product.price;
        };
      }
    );

    let total = orderItems.foldLeft(0.0, func(acc, item) { acc + (item.price * item.quantity.toFloat()) });

    let order : Order = {
      id = nextOrderId;
      customer = caller;
      customerName;
      address;
      phone;
      paymentMethod;
      items = orderItems;
      total;
      timestamp = Time.now();
    };

    orders.add(order.id, order);
    carts.remove(caller);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };

    let userOrders = orders.values().toArray().filter(func(order) { order.customer == caller });
    userOrders;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };
};
