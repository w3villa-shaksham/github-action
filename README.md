# Mini Mall 🛍️

A small mall / e-commerce app built with **Node.js + Express.js**, made to be a
safe playground for learning **GitHub Actions and CI/CD**.

It has a product list, a working cart and a JSON API. That is enough to practise
things like running tests on every push, linting, building a Docker image,
deploying, and adding a health-check step to a pipeline — without the app itself
becoming complicated.

> **Note:** this repository intentionally contains **no GitHub Actions workflows**.
> Writing `.github/workflows/*.yml` is the exercise, so that part is left to you.

---

## Requirements

| Tool    | Version                     |
| ------- | --------------------------- |
| Node.js | 18.17 or newer (20+ / 22+ recommended) |
| npm     | 9 or newer (ships with Node.js) |

Check what you have:

```bash
node --version
npm --version
```

There is nothing else to install: the database is a JSON file and the tests use
Node.js' built-in test runner.

---

## Installation

```bash
git clone <your-repo-url>
cd mall-app
npm install
```

`npm install` creates `node_modules/` and `package-lock.json`. Commit the lock
file — CI relies on it for reproducible installs.

---

## Running the app locally

```bash
npm start
```

Then open <http://localhost:3000>.

You should see the product grid, a category filter, and a cart you can add to and
remove from.

### Other commands

| Command         | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `npm start`     | Starts the server on port 3000 (or `$PORT`).                     |
| `npm run dev`   | Same, but restarts automatically when a file changes.            |
| `npm test`      | Runs the automated tests once and exits.                         |

Change the port with an environment variable:

```bash
PORT=8080 npm start
```

---

## Running the tests

```bash
npm test
```

The suite uses Node.js' built-in test runner (`node:test`) with no extra
dependencies. You should see all tests pass:

```
# tests 25
# pass 25
# fail 0
```

What is covered:

- `GET /health`
- `GET /api/products` — shape of the list and categories
- `GET /api/products/:id` — happy path
- Invalid product id → `400`
- Missing product → `404`
- Unknown route → `404`
- Cart: add, view, remove, empty, and total price calculation

The tests start the real Express app on a random free port and talk to it over
HTTP, so no port conflicts and no mocking.

---

## API endpoints

### Health

| Method | Path      | Description                    |
| ------ | --------- | ------------------------------ |
| GET    | `/health` | Returns `{"status":"ok", ...}` |

### Products

| Method | Path              | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/products`       | All products (short alias)               |
| GET    | `/products/:id`   | One product (short alias)                |
| GET    | `/api/products`   | All products                             |
| GET    | `/api/products/:id` | One product                            |

### Cart

| Method | Path               | Description                                       |
| ------ | ------------------ | ------------------------------------------------- |
| GET    | `/api/cart`        | The current cart with totals                      |
| POST   | `/api/cart`        | Adds a product — body: `{ "productId": 1, "quantity": 2 }` |
| DELETE | `/api/cart/:id`    | Removes one product from the cart                  |
| DELETE | `/api/cart`        | Empties the cart                                   |

### Error format

Every error comes back in the same shape, with a sensible HTTP status code:

```json
{
  "error": {
    "status": 404,
    "message": "Product with id 9999 was not found."
  }
}
```

| Status | When                                                    |
| ------ | ------------------------------------------------------- |
| 400    | Invalid product id or quantity, missing `productId`     |
| 404    | Unknown product, unknown route                          |
| 500    | Unexpected server error (message is hidden in prod)     |

---

## Example API requests

Health check:

```bash
curl http://localhost:3000/health
```

All products:

```bash
curl http://localhost:3000/api/products
```

One product:

```bash
curl http://localhost:3000/api/products/1
```

A product that does not exist (404):

```bash
curl -i http://localhost:3000/api/products/9999
```

An invalid id (400):

```bash
curl -i http://localhost:3000/api/products/abc
```

Add to cart:

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

View the cart:

```bash
curl http://localhost:3000/api/cart
```

```json
{
  "items": [
    {
      "productId": 1,
      "name": "Classic White T-Shirt",
      "price": 19.99,
      "category": "Clothing",
      "image": "👕",
      "quantity": 2,
      "lineTotal": 39.98
    }
  ],
  "totalItems": 2,
  "totalPrice": 39.98,
  "currency": "USD"
}
```

Remove from cart:

```bash
curl -X DELETE http://localhost:3000/api/cart/1
```

Empty the cart:

```bash
curl -X DELETE http://localhost:3000/api/cart
```

---

## Project structure

```text
mall-app/
├── src/
│   ├── app.js                 # Creates the Express app (no listen, so tests can use it)
│   ├── server.js              # Starts/stops the HTTP server
│   ├── errors.js              # AppError helpers (badRequest, notFound)
│   ├── routes/
│   │   ├── index.js           # Top level routing: /health, /api, /products, /
│   │   ├── apiRoutes.js       # Everything under /api
│   │   ├── productRoutes.js   # /products and /api/products
│   │   └── cartRoutes.js      # /api/cart
│   ├── controllers/           # HTTP layer: read request, call service, reply
│   │   ├── pageController.js
│   │   ├── productController.js
│   │   └── cartController.js
│   ├── services/              # Business rules (validation, totals)
│   │   ├── productService.js
│   │   └── cartService.js
│   ├── middleware/
│   │   ├── notFoundHandler.js # 404 for unknown routes
│   │   └── errorHandler.js    # One consistent JSON error shape
│   └── data/                  # The "database"
│       ├── products.json      # Products live here — edit freely
│       ├── catalogStore.js    # Reads products.json
│       └── cartStore.js       # In-memory cart
├── public/                    # Frontend (no framework, no build step)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── test/
│   ├── helpers/testServer.js  # Boots the app on a random port for tests
│   ├── health.test.js
│   ├── products.test.js
│   └── cart.test.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

### How a request flows through the code

```text
request
  → src/app.js          middleware: JSON parsing, logging, static files
  → src/routes/         which route matches?
  → src/controllers/    read the request, call the service
  → src/services/       the rules and calculations
  → src/data/           reading/writing the data
  ← response (JSON)
  → src/middleware/errorHandler.js   on errors only
```

### Things worth trying

- Add a product in `src/data/products.json` — it shows up on the page immediately.
- Change the mall name in the same file (`mallName`).
- Break the `totalPrice` calculation on purpose and watch `npm test` catch it.

---

## Future CI/CD ideas — for you to implement

These are deliberately **not** implemented. Each one is a small, self-contained
exercise. Pick them in this order if you want a gradual path.

### Beginner

1. **CI: run tests on every push and pull request.**
   Trigger: `push` and `pull_request`. Steps: check out the repo, set up Node,
   `npm ci`, `npm test`. Add a badge to this README.

2. **Matrix testing.** Run `npm test` on Node 18, 20 and 22 using
   `strategy.matrix`, so you see a green check per version.

3. **Node version pinning.** Use `actions/setup-node` with a `.nvmrc` or the
   `node-version` input, and turn on `cache: 'npm'`.

4. **Lint job.** Add ESLint, then a workflow step that fails on lint errors.

5. **Separate CI and CD.** One workflow runs tests on every push; a second one
   only deploys after CI succeeds, using GitHub Environments with protection
   rules.

### Intermediate

6. **Coverage report.** `node --test --experimental-test-coverage`, upload the
   output as a build artifact.

7. **Build a Docker image.** Add a `Dockerfile`, build it in CI, and push it to
   GitHub Container Registry or Docker Hub.

8. **Smoke test the deployed app.** After deploying, hit `/health` and fail the
   job if the status is not `ok`.

9. **Deploy on release.** Trigger on `release: published`, deploy to a Node
   host, Render, Railway or Fly.io, then run the smoke test.

10. **Scheduled checks.** A nightly workflow that curls `/health` and opens an
    issue when it fails.

### Advanced

11. **Matrix deploy + rollback.** Deploy to staging, smoke test, then promote
    to production automatically.
12. **Secret handling.** Move credentials into repository secrets instead of
    committed config files.
13. **Self-hosted runner.** Run the same workflow on your own machine to
    understand what changes.
14. **Bundle analysis.** Report the size of `node_modules` to catch a dependency
    that crept in.

---

## License

MIT — use it freely as a learning project.
