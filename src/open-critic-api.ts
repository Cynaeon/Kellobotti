import config from '../config.json';
import fetch from "node-fetch";

interface SearchResult {
    id: number,
    name: string,
    /**
     * The percentage of trigram matches on the smaller term.
     * 0 means a perfect match, while 1 means no overlap at all.
     * In general, matches that are closer than 0.35 are pretty close.
     */
    dist: number
}

const API_ADDRESS = `https://opencritic-api.p.rapidapi.com`;
const HEADERS = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': config.openCriticApiKey,
        'x-rapidapi-host': 'opencritic-api.p.rapidapi.com'
    }
}

async function getGamesBySearchTerm(term: string): Promise<any> {
    const res = await fetch(API_ADDRESS + '/game/search', HEADERS);
    console.log(res);
}

async function getGameById(id: number): Promise<any> {
    const res = await fetch(`${API_ADDRESS}/game/${id}`, HEADERS);
    const result = JSON.parse(await res.text());
    return result;
}

async function getGame(searchTerm: string): Promise<SearchResult | undefined> {
    const res = await fetch(`${API_ADDRESS}/game/search?criteria=${searchTerm}`, HEADERS);

    if (res.status === 429) {
        // Daily quota met.
        return undefined;
    }

    const resText = await res.text();
    let results = JSON.parse(resText) as SearchResult[];
    return results
        .filter(result => result.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.dist - b.dist)
        .at(0);
}

export const openCriticApi = {
    getGamesBySearchTerm,
    getGameById,
    getGame,
}