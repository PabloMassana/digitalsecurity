const bcrypt = require("bcryptjs");
const { connect, getDb, closeConnection} = require("./db");

const SEED_BUYER_PASSWORD = process.env.SEED_BUYER_PASSWORD;
const SEED_SELLER_PASSWORD = process.env.SEED_SELLER_PASSWORD;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;


async function seedUsers(db) {
    const users = [
        {username: "comprador1", email: "c1@mail.com", role: "buyer",  password: SEED_BUYER_PASSWORD },
        {username: "vendedor1", email: "v1@mail.com", role: "seller",  password: SEED_SELLER_PASSWORD },
        {username: "admin1", email: "admin@mail.com", role: "admin",  password: SEED_ADMIN_PASSWORD }
    ];

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, 12);
        await db.collection("users").updateOne(
            { email: u.email }, 
            {$set: { username: u.username, passwordHash: hashedPassword, role: u.role, updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() }
        }, 
            { upsert: true }
        );
}
}

async function seedMovies(db){
    const moviesRaw = [
  {
    id: 1,
    title: "Neon Runner",
    year: 1986,
    genre: "Ciencia ficción",
    runtime: "1h 52m",
    rating: "R",
    tagline: "La ciudad duerme. Ella no.",
    synopsis:
      "En una metrópolis empapada de lluvia, una mensajera nocturna descubre una cinta que puede reescribir los recuerdos. Antes del amanecer tendrá que elegir qué pasado merece sobrevivir.",
    cast: ["Mara Vega", "Dante Cruz", "Iris Moon"],
    image: "neon-runner.jpg",
    color: "#ff2e88",
  },
  {
    id: 2,
    title: "Midnight Call",
    year: 1979,
    genre: "Terror",
    runtime: "1h 38m",
    rating: "+18",
    tagline: "No contestes después de medianoche.",
    synopsis:
      "Una locutora recibe llamadas de alguien que conoce el futuro. Cada predicción se cumple, hasta que la voz anuncia que ella será la próxima noticia.",
    cast: ["Clara Reed", "Tomás Black", "June Voss"],
    image: "midnight-call.jpg",
    color: "#2ee6ff",
  },
  {
    id: 3,
    title: "Velvet Crime",
    year: 1992,
    genre: "Thriller",
    runtime: "2h 04m",
    rating: "+16",
    tagline: "Todos guardan una cinta.",
    synopsis:
      "Un detective sin placa persigue una grabación desaparecida por los clubes de la ciudad. En cada copia encuentra una versión distinta del mismo crimen.",
    cast: ["Nico Saint", "Lola Knox", "Rex Medina"],
    image: "velvet-crime.jpg",
    color: "#ffd23f",
  },
  {
    id: 4,
    title: "Electric Hearts",
    year: 1984,
    genre: "Romance",
    runtime: "1h 44m",
    rating: "+13",
    tagline: "Dos desconocidos. Una última canción.",
    synopsis:
      "Durante el apagón del verano, dos jóvenes se conocen en un salón recreativo. Solo tienen una noche y el lado B de un casete para recordarse.",
    cast: ["Alma Ray", "Leo Sparks", "Mina Fox"],
    image: "electric-hearts.jpg",
    color: "#ff2e88",
  },
  {
    id: 5,
    title: "Last Screening",
    year: 1976,
    genre: "Drama",
    runtime: "1h 57m",
    rating: "TP",
    tagline: "La función termina. La historia no.",
    synopsis:
      "El proyeccionista de un cine a punto de cerrar prepara una última función secreta para los habitantes del barrio que crecieron entre sus butacas.",
    cast: ["Bruno Alba", "Eva Mar", "Saúl Reyes"],
    image: "last-screening.jpg",
    color: "#ffd23f",
  },
  {
    id: 6,
    title: "Arcade Ghosts",
    year: 1997,
    genre: "Ciencia ficción",
    runtime: "1h 41m",
    rating: "+13",
    tagline: "Insert coin to remember.",
    synopsis:
      "Tres amigos encuentran una máquina recreativa que nunca existió. Al superar cada nivel, alguien olvidado regresa al mundo real.",
    cast: ["Kai Flores", "Nora Pixel", "Max Zero"],
    image: "arcade-ghosts.jpg",
    color: "#2ee6ff",
  },
];

// Quitamos id (lo asigna Mongo) e image (el póster se carga aparte)
const movies = moviesRaw.map(({id, image, ...rest}) => rest);
const seller = await db.collection("users").findOne({email: "v1@mail.com"});

if (!seller){
    throw new Error("No existe el vendedor v1@mail.com: ejecuta primero seedUsers");
}

    for (const m of movies){
        await db.collection("movies").updateOne(
            {title: m.title, year: m.year},
            { $set: { ...m, sellerId: seller._id, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() },},
            {upsert: true}
        );
        console.log("Película lista:", m.title);
    }

}


async function main(){
    await connect();
    const db = getDb();
    await seedUsers(db);
    await seedMovies(db);
    await closeConnection();
    console.log("Seed de usuarios y películas listo");
}

main().catch(err => {console.error(err); process.exit(1); });
