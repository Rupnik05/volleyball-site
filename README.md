# Volleyball Tournament Registration

A simple website for volleyball tournament registration.

## How to Run

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Start the server:**
   ```
   npm start
   ```

3. **Access the application:**
   - Registration page: [http://localhost:3000](http://localhost:3000)
   - Admin page: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deployment on Render.com

1. **Create a new Web Service on Render.**
2. **Connect your Git repository.**
3. **Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Add Environment Variables:**
   - `NODE_ENV`: `production`
5. **Deploy!** Render will automatically install dependencies and start the server.

**Note on SQLite:** Render's free tier has an ephemeral filesystem. This means your SQLite database will be reset on every deploy. For persistent storage, consider using a managed database service like Neon (Postgres) or upgrading to a paid Render plan with a persistent disk.
