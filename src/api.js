import axios from 'axios';

const API_BASE_URI = 'https://dbsprqhst2.execute-api.us-east-1.amazonaws.com/test/';

class API {
  get(uri, params={}) {
    const promise = new Promise(
      (resolve, reject)=> {
        axios.get(
          API_BASE_URI + uri,
          {
            params: params,
            crossDomain: true
          }
        )
          .then((response)=> {
            resolve(response.data);
          })
          .catch((response)=> {
            reject(response);
          });
      }
    );

    return promise;
  }


  getPoints() {
    return this.get('points');
  }

}

export default API;
