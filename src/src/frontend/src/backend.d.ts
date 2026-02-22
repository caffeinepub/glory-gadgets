import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: bigint;
    rating: number;
    image: ExternalBlob;
    price: number;
}
export interface Category {
    id: bigint;
    name: string;
}
export type Time = bigint;
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: number;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    total: number;
    paymentMethod: string;
    customer: Principal;
    address: string;
    timestamp: Time;
    phone: string;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
}
export interface Review {
    productId: bigint;
    comment: string;
    rating: bigint;
    reviewer: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReview(productId: bigint, reviewer: string, rating: bigint, comment: string): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCategory(name: string): Promise<bigint>;
    createProduct(name: string, description: string, price: number, category: bigint, image: ExternalBlob): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategory(id: bigint): Promise<Category>;
    getOrderHistory(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProductReviews(productId: bigint): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, address: string, phone: string, paymentMethod: string): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(text: string): Promise<Array<Product>>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: number, category: bigint, image: ExternalBlob): Promise<void>;
}
