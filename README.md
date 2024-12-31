# Inventory Management System

A simple inventory management system built with Remix.js, Postgres, and Shopify Polaris.

## Features

- List all products
- Add new products
- Edit product titles (double-click to edit)
- Adjust product quantities
- Delete products with confirmation

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/farooqpk/inventory-management
cd inventory-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env`
   - Update DATABASE_URL in `.env` with your PostgreSQL connection string

4. Run database migrations:
```bash
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

6. Visit `http://localhost:5173` in your browser

## Implementation Details

### Tech Stack
- **Framework**: Remix.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: Shopify Polaris


### Data Model

The application uses a simple product model with the following fields:
- id (String, primary key)
- title (String)
- quantity (Integer)
- createdAt (DateTime)
- updatedAt (DateTime)
