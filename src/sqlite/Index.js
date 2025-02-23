import Database from "tauri-plugin-sql-api";

const dropIfProducts = `
    DROP TABLE IF EXISTS products;
   `;
const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            codigo TEXT,
            pcosto TEXT,
            tventa TEXT,
            organization_id INTEGER NOT NULL
        )
   `;
const dropIfPrecios = `
    DROP TABLE IF EXISTS precios;
   `;
const createPreciosTable = `
        CREATE TABLE IF NOT EXISTS precios (
            id INTEGER PRIMARY KEY,
            product_id INTEGER NOT NULL,
            almacen_id INTEGER NOT NULL,
            precio TEXT 
        )
   `;
const dropIfAlmacens = `
    DROP TABLE IF EXISTS almacens;
   `;
const createAlmacensTable = `
        CREATE TABLE IF NOT EXISTS almacens (
            id INTEGER PRIMARY KEY,
            organization_id INTEGER NOT NULL,
            name TEXT NOT NULL
        )
   `;
const dropIfClientes = `
    DROP TABLE IF EXISTS clientes;
   `;
const createClientesTable = `
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY,
            organization_id INTEGER NOT NULL,
            name TEXT NOT NULL
        )
   `;
const dropIfTickets = `
    DROP TABLE IF EXISTS tickets;
   `;
const createTicketsTable = `
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY,
            organization_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            almacen_id INTEGER,
            cliente_id INTEGER,
            nombre TEXT,
            esta_abierto INTEGER DEFAULT 1 NOT NULL,
            subtotal TEXT DEFAULT 0 NOT NULL,
            total TEXT DEFAULT 0 NOT NULL,
            pago_con TEXT DEFAULT 0 NOT NULL,
            credito INTEGER DEFAULT 0 NOT NULL,
            pendiente INTEGER DEFAULT 0 NOT NULL,
            pagado_en TEXT
        )
   `;
const dropIfArticulos = `
    DROP TABLE IF EXISTS articulos;
   `;
const createArticulosTable = `
        CREATE TABLE IF NOT EXISTS articulos (
            id INTEGER PRIMARY KEY,
            ticket_id INTEGER,
            product_id INTEGER,
            name TEXT NOT NULL,
            cantidad TEXT NOT NULL,
            precio TEXT NOT NULL,
            importe TEXT NOT NULL
        )
   `;
async function initializeDatabase() {
    return await Database.load("sqlite:daventas.db");
}
const initDb = async (drop) => {
    const db = await initializeDatabase();
    if (drop) {
        await db.execute(dropIfProducts);
        await db.execute(dropIfPrecios);
        await db.execute(dropIfAlmacens);
        await db.execute(dropIfTickets);
        await db.execute(dropIfArticulos);
        await db.execute(dropIfClientes);
    }
    await db.execute(createProductsTable);
    await db.execute(createPreciosTable);
    await db.execute(createAlmacensTable);
    await db.execute(createTicketsTable);
    await db.execute(createArticulosTable);
    await db.execute(createClientesTable);
}
const deleteProducts = async () => {
    const db = await initializeDatabase();
    await db.execute(dropIfProducts);
    await db.execute(createProductsTable);
}
const deletePrecios = async (drop) => {
    const db = await initializeDatabase();
    await db.execute(dropIfPrecios);
    await db.execute(createPreciosTable);
}
const deleteAlmacens = async (drop) => {
    const db = await initializeDatabase();
    await db.execute(dropIfAlmacens);
    await db.execute(createAlmacensTable);
}
const deleteClientes = async (drop) => {
    const db = await initializeDatabase();
    await db.execute(dropIfClientes);
    await db.execute(createClientesTable);
}

export default {
    initDb,
    deleteProducts,
    deletePrecios,
    deleteAlmacens,
    deleteClientes,
};

