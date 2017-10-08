import _ from 'lodash';
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

  post(uri, data={}, config={}) {
    config = _.defaults(config, {crossDomain: true});

    const promise = new Promise(
      (resolve, reject)=> {
        axios.post(
          API_BASE_URI + uri,
          data,
          config
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

  addPoints(house, points, reason='None given.') {
    // Does object destructuring work in ECMAScript 2015?
    return this.post('points/add', {
      house,
      points,
      reason
    });
  }

}

export default API;
