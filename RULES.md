# SoleStride engineering rules

- Use MongoDB with Mongoose, Express, React with Vite, and Node.js.
- Keep external payment, authentication, email, cloud-image, and other third-party APIs out of the application.
- Hash passwords with bcryptjs and use JWT bearer tokens for authentication.
- Store product images locally through Multer in `server/uploads/`.
- Store prices as numbers in NPR and format all frontend prices through `formatPrice`.
- Keep API responses in the `{ success, data, message }` or `{ success: false, message }` envelope.
- Recalculate order totals and check/decrement stock using server-side product records.
- Never return user password hashes.
- Keep user and admin endpoints protected with role-aware middleware.
