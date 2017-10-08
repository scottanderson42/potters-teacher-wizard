import _ from 'lodash';
import {Howl} from 'howler';

import SoundGryffindor from '../../assets/sounds/gryffindor.mp3';
import SoundHufflepuff from '../../assets/sounds/hufflepuff.mp3';
import SoundRavenclaw from '../../assets/sounds/ravenclaw.mp3';
import SoundSlytherin from '../../assets/sounds/slytherin.mp3';

import PointsAwarded from '../../assets/sounds/points_awarded.mp3';
import PointsDeducted from '../../assets/sounds/points_deducted.mp3';

import Points01 from '../../assets/sounds/points_01.mp3';
import Points02 from '../../assets/sounds/points_02.mp3';
import Points03 from '../../assets/sounds/points_03.mp3';
import Points04 from '../../assets/sounds/points_04.mp3';
import Points05 from '../../assets/sounds/points_05.mp3';
import Points06 from '../../assets/sounds/points_06.mp3';
import Points07 from '../../assets/sounds/points_07.mp3';
import Points08 from '../../assets/sounds/points_08.mp3';
import Points09 from '../../assets/sounds/points_09.mp3';
import Points10 from '../../assets/sounds/points_10.mp3';
import Points11 from '../../assets/sounds/points_11.mp3';
import Points12 from '../../assets/sounds/points_12.mp3';
import Points13 from '../../assets/sounds/points_13.mp3';
import Points14 from '../../assets/sounds/points_14.mp3';
import Points15 from '../../assets/sounds/points_15.mp3';
import Points16 from '../../assets/sounds/points_16.mp3';
import Points17 from '../../assets/sounds/points_17.mp3';
import Points18 from '../../assets/sounds/points_18.mp3';
import Points19 from '../../assets/sounds/points_19.mp3';
import Points20 from '../../assets/sounds/points_20.mp3';

import Meow from '../../assets/sounds/meow.mp3';

const HOUSE_SOUNDS = {
  gryffindor: SoundGryffindor,
  hufflepuff: SoundHufflepuff,
  ravenclaw: SoundRavenclaw,
  slytherin: SoundSlytherin
}

const POINTS_SOUNDS = {
  1: Points01,
  2: Points02,
  3: Points03,
  4: Points04,
  5: Points05,
  6: Points06,
  7: Points07,
  8: Points08,
  9: Points09,
  10: Points10,
  11: Points11,
  12: Points12,
  13: Points13,
  14: Points14,
  15: Points15,
  16: Points16,
  17: Points17,
  18: Points18,
  19: Points19,
  20: Points20,
}

class ExpectoCaponigro {
  constructor() {
    this.pointsQueue = [];
    this.running = false;
  }

  addPoints(house, points) {
    this.pointsQueue.push({house, points});
    if (!this.running) {
      this._serviceQueue();
    }
  }

  _runSounds(house, points) {
    this.running = true;

    this._createChainableSound(POINTS_SOUNDS[Math.abs(points)], points)
      .then( ()=> {
        if (points >= 0) {
          return this._createChainableSound(PointsAwarded, 'points awarded');
        } else {
          return this._createChainableSound(PointsDeducted, 'points deducted');
        }
      })
      .then( ()=> {
        return this._createChainableSound(HOUSE_SOUNDS[house], house);
      })
      // .then( ()=> {
      //   return this._createChainableSound(Meow, 'meow');
      // })
      .then( ()=> {
        console.log('END OF SOUNDS');
        this._serviceQueue();
      })
      .catch( (error)=> {
        this._serviceQueue();
        console.error('Error during sound queue:', error);
      });
  }

  _serviceQueue() {
    console.log('SERVICE QUEUE', this.pointsQueue.length);
    this.running = false;
    if (this.pointsQueue.length) {
      const next = this.pointsQueue.pop();
      this._runSounds(next.house, next.points);
    }
  }

  _createChainableSound(soundUrl, label) {
    const playingSound = new Promise( (resolve, reject) => {
      const houseSound = new Howl({
        src: [soundUrl],
        onend: resolve
      });
      console.log('PLAYING', label);
      houseSound.play();
    });

    return playingSound;
  }

  _pause(milliseconds) {
    return new Promise( (resolve, reject) => {
      setTimeout(resolve, milliseconds);
    });
  }
}

export default ExpectoCaponigro;



