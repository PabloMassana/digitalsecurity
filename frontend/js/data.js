const movies = [
  {id:1,title:"Neon Runner",year:1986,genre:"Ciencia ficción",runtime:"1h 52m",rating:"R",tagline:"La ciudad duerme. Ella no.",synopsis:"En una metrópolis empapada de lluvia, una mensajera nocturna descubre una cinta que puede reescribir los recuerdos. Antes del amanecer tendrá que elegir qué pasado merece sobrevivir.",cast:["Mara Vega","Dante Cruz","Iris Moon"],image:"https://images.unsplash.com/photo-1524889777220-eae0b973ec80?auto=format&fit=crop&w=900&q=85",color:"#ff2e88"},
  {id:2,title:"Midnight Call",year:1979,genre:"Terror",runtime:"1h 38m",rating:"+18",tagline:"No contestes después de medianoche.",synopsis:"Una locutora recibe llamadas de alguien que conoce el futuro. Cada predicción se cumple, hasta que la voz anuncia que ella será la próxima noticia.",cast:["Clara Reed","Tomás Black","June Voss"],image:"https://images.unsplash.com/photo-1580747182688-aa1f07847e8c?auto=format&fit=crop&w=900&q=85",color:"#2ee6ff"},
  {id:3,title:"Velvet Crime",year:1992,genre:"Thriller",runtime:"2h 04m",rating:"+16",tagline:"Todos guardan una cinta.",synopsis:"Un detective sin placa persigue una grabación desaparecida por los clubes de la ciudad. En cada copia encuentra una versión distinta del mismo crimen.",cast:["Nico Saint","Lola Knox","Rex Medina"],image:"https://images.unsplash.com/photo-1598880170141-504b35c365f0?auto=format&fit=crop&w=900&q=85",color:"#ffd23f"},
  {id:4,title:"Electric Hearts",year:1984,genre:"Romance",runtime:"1h 44m",rating:"+13",tagline:"Dos desconocidos. Una última canción.",synopsis:"Durante el apagón del verano, dos jóvenes se conocen en un salón recreativo. Solo tienen una noche y el lado B de un casete para recordarse.",cast:["Alma Ray","Leo Sparks","Mina Fox"],image:"https://images.unsplash.com/photo-1632506683759-09b3b45fce67?auto=format&fit=crop&w=900&q=85",color:"#ff2e88"},
  {id:5,title:"Last Screening",year:1976,genre:"Drama",runtime:"1h 57m",rating:"TP",tagline:"La función termina. La historia no.",synopsis:"El proyeccionista de un cine a punto de cerrar prepara una última función secreta para los habitantes del barrio que crecieron entre sus butacas.",cast:["Bruno Alba","Eva Mar","Saúl Reyes"],image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=85",color:"#ffd23f"},
  {id:6,title:"Arcade Ghosts",year:1997,genre:"Ciencia ficción",runtime:"1h 41m",rating:"+13",tagline:"Insert coin to remember.",synopsis:"Tres amigos encuentran una máquina recreativa que nunca existió. Al superar cada nivel, alguien olvidado regresa al mundo real.",cast:["Kai Flores","Nora Pixel","Max Zero"],image:"https://images.unsplash.com/photo-1713630019375-f483a9729a8b?auto=format&fit=crop&w=900&q=85",color:"#2ee6ff"}
];
const KEY = "nocturno-favorites";
function getFavs(){
    try { 
        return JSON.parse(localStorage.getItem(KEY)||"[]"); 
    } catch(e){ return []; } 
}
function setFavs(f){ 
    try { 
        localStorage.setItem(KEY, JSON.stringify(f)); 
    } catch(e){} }
function toggleFav(id){
    const f=getFavs();
    const n=f.includes(id)?f.filter(x=>x!==id):[...f,id];
    setFavs(n); 
    return n; 
}
function updateListCount(){ 
    const el=document.getElementById("list-count");
    if(el) el.textContent=getFavs().length; 
}
function toggleCRT(btn){
  const on=document.querySelector(".app").classList.toggle("crt-on");
  btn.classList.toggle("on",on);
  btn.lastChild.textContent=" CRT "+(on?"ON":"OFF");
}