// const cliendId = '5faf3952b05b4cdbb3f87b3413496436';
// const redirecUri = 'http://localhost:3000/';
// let accessToken;

// const Spotify = { 
//     getAccessToken() {
//         if (accessToken) {
//             return accessToken;
//         }

//         //check for access token match
//         const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
//         const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

//         if (accessTokenMatch && expiresInMatch) {
//             accessToken = accessTokenMatch[1];
//             const expiresIn = Number(expiresInMatch[1]);
//             //This clears the parameters, allowing us to grab a new access token when it expires.
//             window.setTimeout(() => accessToken = '', expiresIn * 1000);
//             window.history.pushState('Access Token', null, '/');
//             return accessToken;
//         } else {
//             const accessUrl = `https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirecUri}`;
//             window.location = accessUrl;
//         }
//     },

//     search(term) {
//         const accessToken = Spotify.getAccessToken();
//         return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, 
//         { headers: {
//             Authorization: `Bearer ${accessToken}`
//             }
//         }).then(response => response.json()
//         ).then(jsonResponse => {
//             if(!jsonResponse.tracks) {
//                 return [];
//             }
//             return jsonResponse.tracks.items.map(track => {
//                 return {
//                     id: track.id,
//                     name: track.name,
//                     artist: track.artist[0].name,
//                     album: track.album.name,
//                     uri: track.uri 
//                 }
//             })
//         })
//     },

//     savePlaylist(name, trackUris) {
//         if(!name || !trackUris.length) {
//             return;
//         }
//         const accessToken = Spotify.getAccessToken();
//         const headers = {
//             Authorization: `Bearer ${accessToken}`
//         };
//         let userId;

//         return fetch('https://api.spotify.com/v1/me', {headers: headers}
//         ).then(response => response.json()
//         ).then(jsonResponse => {
//             userId = jsonResponse.id;
//             return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
//                 headers: headers,
//                 method: 'POST',
//                 body: JSON.stringify({name: name})
//             }).then(response => response.json()
//             ).then(jsonResponse => {
//                 const playlistId = jsonResponse.id;
//                 return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
//                     headers: headers,
//                     method: 'POST',
//                     body: JSON.stringify({uris: trackUris})
//                 })
//             })
//         });
//     }
// }

// export default Spotify;

const clientId = '5faf3952b05b4cdbb3f87b3413496436';
const redirectUri = 'http://localhost:3000/';
const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=token&scope=playlist-modify-public&client_id=${clientId}&redirect_uri=${redirectUri}`;
let accessToken = undefined;
let expiresIn = undefined;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);
    if (urlAccessToken && urlExpiresIn) {
      accessToken = urlAccessToken[1];
      expiresIn = urlExpiresIn[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
    } else {
      window.location = spotifyUrl;
    }
  },

  search(term) {
    const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${term.replace(' ', '%20')}`;
    return fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(jsonResponse => {
        if (!jsonResponse.tracks) return [];
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        })
      });
  },

  savePlaylist(name, trackUris) {
    if (!name || !trackUris || trackUris.length === 0) return;
    const userUrl = 'https://api.spotify.com/v1/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };
    let userId = undefined;
    let playlistId = undefined;
    fetch(userUrl, {
      headers: headers 
    })
    .then(response => response.json())
    .then(jsonResponse => userId = jsonResponse.id)
    .then(() => {
      const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
      fetch(createPlaylistUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            name: name
          })
        })
        .then(response => response.json())
        .then(jsonResponse => playlistId = jsonResponse.id)
        .then(() => {
          const addPlaylistTracksUrl = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
          fetch(addPlaylistTracksUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              uris: trackUris
            })
          });
        })
    })
  }
};

export default Spotify;