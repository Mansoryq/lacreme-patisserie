# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People in Astana choosing desserts, pastry, gifts, or celebration cakes for a personal occasion; they need to browse the real assortment, assemble a request, and select a pickup or delivery time without paying online.

## Product Purpose

La Crème Boutique is a digital storefront and order-request system for a pâtisserie. It lets a guest discover the assortment, add products to a persistent basket, send an order request, and receive a confirmed order number.

## Positioning

The boutique pairs French pâtisserie with its own signature and national collections, while retaining a real order-confirmation workflow rather than pretending the request is an online payment.

## Operating Context

The storefront is used primarily on mobile and desktop before a celebration or a visit to the boutique. Staff receive customer requests through the existing operational integrations and confirm the details directly.

## Capabilities and Constraints

- Catalogue, product pages, basket, order request, pickup/delivery choice, schedule slots, Telegram notifications, and an admin area already exist in the Next.js application.
- No online payment is offered.
- Product facts, photography, descriptions, availability, and prices come from the existing database and supplied La Crème materials; unverified details must not be invented.
- Pre-order products affect the earliest selectable pickup date.

## Brand Commitments

La Crème Boutique is a French pâtisserie in Astana. The supplied round lavender La Crème Boutique mark and the supplied real product imagery are binding brand assets. The intended voice is polished, warm, sensory, and restrained.

## Evidence on Hand

- Product and category data: local SQLite database under `data/`.
- Real product imagery: `public/images/products/`.
- Brand mark: `public/images/brand/logo.jpg`.
- Source menu files provided by the user: `Каталог Десертов и Выпечки.pdf`, `Меню La Creme.pdf`, and `Меню Бар La Creme.pdf`.

## Product Principles

1. Let the actual desserts lead the decision.
2. Make ordering feel calm and explicit from selection to confirmation.
3. Preserve product truth over decorative marketing.
4. Make a premium experience approachable on a phone.

## Accessibility & Inclusion

Use clear Russian labels, semantic controls, visible keyboard focus, readable contrast, and responsive layouts.
