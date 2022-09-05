const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;

  const types = pokeDetail.types.map((typesSlot) => typesSlot.type.name);
  const [type] = types;

  pokemon.types = types;
  pokemon.type = type;

  pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

  return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemons = (offset = 0, limit = 5) => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequest) => Promise.all(detailRequest))
    .then((pokemonDetails) => pokemonDetails);
};

function openInfo(id) {
  let modal = document.getElementById("info-modal");
  fetchPokemonInfo(id);
  updateCurrentPokemonImage(id);

  if (typeof modal == "undefined" || modal === null) return;

  modal.style.display = "Block";
}

async function fetchPokemonInfo(id) {
  const urlPokemon = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const urlSpecies = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
  const responsePokemon = await fetch(urlPokemon);
  const responseSpecies = await fetch(urlSpecies);
  const pokemon = await responsePokemon.json();
  const species = await responseSpecies.json();

  const reponseEvolutions = await fetch(species.evolution_chain.url);
  const evolution_chain = await reponseEvolutions.json();
  
  setupPokemonAbout(pokemon, species);
  setupPokemonStats(pokemon);
  setupPokemonAbilities(pokemon);
  setupEvolutionChain(evolution_chain);
}

function closeModal() {
  let modal = document.getElementById("info-modal");

  if (typeof modal == "undefined" || modal === null) return;

  modal.style.display = "none";
}

function updateCurrentPokemonImage(id) {

  const currentPokemonImage = document.getElementById('current-pokemon-image');
  const img = new Image();

  img.onload = function() {
      currentPokemonImage.src = this.src;
      currentPokemonImage.style.height = this.height * 3 + 'px';
  };

  if(id >= 650) {
      img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + id + '.png';
  } else {
      img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/' + id + '.gif';
  };
};


/**setup pokemon id, name, types, height, weight and description */
function setupPokemonAbout(pokemon, species) {
  document.getElementById('current-pokemon-id').innerHTML = 'N° ' + pokemon.id;
  document.getElementById('current-pokemon-name').innerHTML = dressUpPayloadValue(pokemon.name);
  document.getElementById('current-pokemon-types').innerHTML = getTypeContainers(pokemon.types);
  document.getElementById('current-pokemon-height').innerHTML = pokemon.height / 10 + 'm';
  document.getElementById('current-pokemon-weight').innerHTML = pokemon.weight / 10 + 'kg';

  for(i = 0; i < species.flavor_text_entries.length; i++) {
      if(species.flavor_text_entries[i].language.name == 'en'){
          document.getElementById('current-pokemon-description').innerHTML = dressUpPayloadValue(species.flavor_text_entries[i].flavor_text.replace('', ' '));
          break;
      };
  };
};

/**get type containers for pokemon infos */
function getTypeContainers(typesArray) {
  let htmlToReturn = '<div class="row">';

  for (let i = 0; i < typesArray.length; i++) {
    htmlToReturn += `<div class="type-container"> ${dressUpPayloadValue(typesArray[i].type.name)}</div>`;
  }

  return htmlToReturn + "</div>";
}

/**dress up payload value */
function dressUpPayloadValue(string) {
  let splitStr = string.toLowerCase().split('-');
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join('/');
}

/**setup pokemon stats */
function setupPokemonStats(pokemon) {
  document.getElementById("current-pokemon-stats-atk").innerHTML =
    pokemon.stats[0].base_stat;
  document.getElementById("current-pokemon-stats-hp").innerHTML =
    pokemon.stats[1].base_stat;
  document.getElementById("current-pokemon-stats-def").innerHTML =
    pokemon.stats[2].base_stat;
  document.getElementById("current-pokemon-stats-spa").innerHTML =
    pokemon.stats[3].base_stat;
  document.getElementById("current-pokemon-stats-spd").innerHTML =
    pokemon.stats[4].base_stat;
  document.getElementById("current-pokemon-stats-speed").innerHTML =
    pokemon.stats[5].base_stat;
  document.getElementById("current-pokemon-stats-total").innerHTML =
    pokemon.stats[0].base_stat +
    pokemon.stats[1].base_stat +
    pokemon.stats[2].base_stat +
    pokemon.stats[3].base_stat +
    pokemon.stats[4].base_stat +
    pokemon.stats[5].base_stat;
}

/**setup pokemon abilities */
function setupPokemonAbilities(pokemon) {
  document.getElementById("current-pokemon-abilitiy-0").innerHTML =
    dressUpPayloadValue(pokemon.abilities[0].ability.name);
  if (pokemon.abilities[1]) {
    document
      .getElementById("current-pokemon-abilitiy-1")
      .classList.remove("hide");
    document.getElementById("current-pokemon-abilitiy-1").innerHTML =
      dressUpPayloadValue(pokemon.abilities[1].ability.name);
  } else {
    document.getElementById("current-pokemon-abilitiy-1").classList.add("hide");
  }
}

/**setup evolution chain (all 3 evolutions) */
function setupEvolutionChain(evolutionChain) {
  const chain = evolutionChain.chain
  const chainContainer =  document.getElementById('current-pokemon-evolution-chain-container')
  const chainImages = [document.getElementById('current-pokemon-evolution-0'), document.getElementById('current-pokemon-evolution-1'), document.getElementById('current-pokemon-evolution-2')]
  const chainLevels = [document.getElementById('current-pokemon-evolution-level-0'), document.getElementById('current-pokemon-evolution-level-1')]

  if(chain.evolves_to.length != 0) {
      chainContainer.classList.remove('hide');

      setupEvolution(chain, 0);

      if(chain.evolves_to[0].evolves_to.length != 0) {
          setupEvolution(chain.evolves_to[0], 1);

          chainImages[2].classList.remove('hide');
          chainLevels[1].classList.remove('hide');
      } else {
          chainImages[2].classList.add('hide');
          chainLevels[1].classList.add('hide');
      };
  } else {
      chainContainer.classList.add('hide');
  };
};

/**setup evolution images and level*/
function setupEvolution(chain, no) {
  const chainImages = [document.getElementById('current-pokemon-evolution-0'), document.getElementById('current-pokemon-evolution-1'), document.getElementById('current-pokemon-evolution-2')];
  const chainLevels = [document.getElementById('current-pokemon-evolution-level-0'), document.getElementById('current-pokemon-evolution-level-1')];
  
  chainImages[no].src= 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(chain.species.url) + '.png';
  chainImages[no].setAttribute('onClick', 'javascript: ' + 'openInfo(' + filterIdFromSpeciesURL(chain.species.url) + ')');
  chainImages[no + 1].src= 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + filterIdFromSpeciesURL(chain.evolves_to[0].species.url) + '.png';
  chainImages[no + 1].setAttribute('onClick', 'javascript: ' + 'openInfo(' + filterIdFromSpeciesURL(chain.evolves_to[0].species.url) + ')');

  if(chain.evolves_to[0].evolution_details[0].min_level) {
      chainLevels[no].innerHTML = 'Lv. ' + chain.evolves_to[0].evolution_details[0].min_level;
  } else {
      chainLevels[no].innerHTML = '?';
  };
};

/**filter id from species url */
function filterIdFromSpeciesURL(url){
  return url.replace('https://pokeapi.co/api/v2/pokemon-species/', '').replace('/', '');
};
