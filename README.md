# SoleStride

A MERN shoe store with local product image uploads, JWT authentication, NPR pricing, shopping cart and checkout, order history, and an admin workspace.

## Requirements

- Node.js 18 or newer
- MongoDB listening at the connection URI configured in `server/.env`

The provided URI is used as-is: `mongodb://localhost:5000`. MongoDB and the Express API cannot both listen on port 5000 on the same machine, so the API defaults to port **5001**. If your MongoDB server is actually on its usual default port, set `MONGO_URI=mongodb://localhost:27017/solestride`.

## Run locally

1. Copy `server/.env.example` to `server/.env`; set a private `JWT_SECRET`. Leave the confirmed MongoDB URI unchanged if MongoDB is listening on port 5000.
2. In `server/`, run `npm install`, then `npm run seed`, then `npm run dev`.
3. In `client/`, run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the client terminal.

Seeded sign-ins:

- Admin: `admin@solestride.com` / `Admin@123`
- Demo user: `user@solestride.com` / `User@123`

The seed command creates eight distinct local SVG product images in `server/uploads/`. Product uploads are stored there and served from `/uploads`; no external product-image or payment service is used.
