const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const maxRecords = 151;
const limit = 10;
let offset = 0;

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons
      .map(
        (pokemon) => `
      <li class="pokemon ${pokemon.type}" onclick="openInfo(${pokemon.number})">
          <span class="number">#${pokemon.number}</span>
          <span class="name">${pokemon.name}</span>

          <div class="detail">
              <ol class="types">
                  ${pokemon.types
                    .map((type) => `<li class="type ${type}">${type}</li>`)
                    .join("")}
              </ol>

              <img src="${pokemon.photo}" alt="${pokemon.name}">
          </div>
      </li>   
    `
      )
      .join("");
    pokemonList.innerHTML += newHtml;
  });
}

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordNextPage = offset + limit;

  if (qtdRecordNextPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItems(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItems(offset, limit);
  }
});

function openInfo(id) {
  let modal = document.getElementById("info-modal")
  fetchPokemonInfo(id);

  if (typeof modal == 'undefined' || modal === null)
  return;

  modal.style.display = 'Block';
}

async function fetchPokemonInfo(id) {
  const urlPokemon = "https://pokeapi.co/api/v2/pokemon/" + id;
  const responsePokemon = await fetch(urlPokemon);
  const pokemon = await responsePokemon.json();

  console.log(pokemon)

  // setupPokemonAbout(pokemon, id, species);
  // setupPokemonStats(pokemon);
  // setupPokemonAbilities(pokemon);
  // setupEvolutionChain(evolution_chain);
  // setupResponsiveBackground(pokemon);

  // slideInPokemonInfo();

  // if (window.innerWidth < 1100) {
  //   openPokemonResponsiveInfo();
  // }
}

function closeModal() {
  let modal = document.getElementById("info-modal");

  if (typeof modal == 'undefined' || modal === null)
  return;

  modal.style.display = 'none';
}
