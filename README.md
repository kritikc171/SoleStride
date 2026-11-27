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

## Deploy to AWS EC2

The deployment files in `infra/`, `server/ecosystem.config.cjs`, and `.github/workflows/deploy.yml` follow the EC2 + CloudFormation + Nginx + PM2 + GitHub Actions approach. The workflow builds the Vite frontend, provisions an Ubuntu 24.04 EC2 instance in `us-east-1` by default, and deploys the API on port `5000`. Nginx serves `client/dist` and proxies `/api/` and `/uploads/` to Express.

### Before deploying

1. Create a MongoDB Atlas cluster and database user. After the first deployment prints the EC2 public IP, add that IP as a `/32` entry in Atlas Network Access, then rerun the workflow. Avoid `0.0.0.0/0` for the database.
2. In GitHub, open **Settings → Secrets and variables → Actions** and add these repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (needed for temporary AWS Learner Lab credentials; otherwise leave unset)
   - `MONGO_URI` (your Atlas URI, e.g. `mongodb+srv://...`)
   - `JWT_SECRET` (a long, randomly generated secret)
3. Add the repository variable `AWS_REGION` with `us-east-1`, or your chosen supported region.
4. The AWS credentials need permission to manage the CloudFormation stack and EC2 resources, read the generated SSM key parameter, and temporarily authorize/revoke SSH ingress on the stack's security group.
5. Ensure the GitHub repository is public so the EC2 bootstrap can clone it. The workflow temporarily allows SSH from its GitHub-hosted runner IP and revokes that rule when deployment finishes.
6. Push to `main` or run **Actions → Deploy SoleStride → Run workflow**. The first run takes longer while CloudFormation installs the server software. Add the printed EC2 IP to Atlas Network Access as a `/32`, then rerun the workflow to bring the API online. The template assumes the AWS account has a default VPC.

The production frontend uses same-origin API paths, so do not set `VITE_API_URL=/api` (the client already prefixes API calls with `/api`). Set the `MONGO_URI` secret to the Atlas URL; `MONGO_URI` is the environment variable this server reads.

The seeded demo accounts use known sample passwords. Do not run `npm run seed` against a public production database unless you first replace those credentials; seeding also deletes and recreates the product catalog. Uploaded files live on the EC2 instance and are not backed up by this deployment workflow. The sample deployment serves HTTP only; add a domain and TLS certificate before handling real customer accounts or payments. AWS resources may incur charges.
