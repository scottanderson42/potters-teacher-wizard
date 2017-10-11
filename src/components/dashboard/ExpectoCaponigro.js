import _ from 'lodash';
import {Howl} from 'howler';

import SoundGryffindor from '../../assets/sounds/gryffindor.mp3';
import SoundHufflepuff from '../../assets/sounds/hufflepuff.mp3';
import SoundRavenclaw from '../../assets/sounds/ravenclaw.mp3';
import SoundSlytherin from '../../assets/sounds/slytherin.mp3';

import PointsAwarded from '../../assets/sounds/points_awarded.mp3';
import PointsDeducted from '../../assets/sounds/points_deducted.mp3';
import FromSound from '../../assets/sounds/from.mp3';
import ToSound from '../../assets/sounds/to.mp3';

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
import Points30 from '../../assets/sounds/points_30.mp3';
import Points40 from '../../assets/sounds/points_40.mp3';
import Points50 from '../../assets/sounds/points_50.mp3';
import Points60 from '../../assets/sounds/points_60.mp3';
import Points70 from '../../assets/sounds/points_70.mp3';
import Points80 from '../../assets/sounds/points_80.mp3';
import Points90 from '../../assets/sounds/points_90.mp3';
import Points100 from '../../assets/sounds/points_100.mp3';
import PointsHundred from '../../assets/sounds/points_hundred.mp3';

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
  30: Points30,
  40: Points40,
  50: Points50,
  60: Points60,
  70: Points70,
  80: Points80,
  90: Points90,
  100: Points100,
  hundred: PointsHundred,
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

    this._getPointsSounds(points)
      .then( ()=> {
        if (points >= 0) {
          return this._createChainableSound(PointsAwarded, 'points awarded');
            // Commented out until we fix the 'to' sound.
            // .then(()=> {
            //   return this._createChainableSound(ToSound, 'to');
            // });
        } else {
          return this._createChainableSound(PointsDeducted, 'points deducted');
            // Commented out until we fix the 'from' sound.
            // .then(()=> {
            //   return this._createChainableSound(FromSound, 'from');
            // });
        }
      })
      .then( ()=> {
        return this._createChainableSound(HOUSE_SOUNDS[house], house);
      })
      .then( ()=> {
        // Pause between announcements.
        return this._pause(500);
      })
      .then( ()=> {
        console.log('END OF SOUNDS');
        this._serviceQueue();
      })
      .catch( (error)=> {
        this._serviceQueue();
        console.error('Error during sound queue:', error);
      });
  }

  _getPointsSounds(originalPoints) {
    const points = Math.abs(originalPoints);
    if (points >= 1000) {
      return this._createChainableSound(Meow, originalPoints);
    }

    const existingSound = this._getUrlForNumber(points);
    if (existingSound) {
      return this._createChainableSound(existingSound, originalPoints);
    }

    let powers = this._numberToPowers(points);
    let numberSoundChain;
    if (powers.length === 3) {
      // 101 or over
      const hundreds = powers[0];
      if (hundreds === 100) {
        numberSoundChain = this._createChainableSound(this._getUrlForNumber(100), hundreds);
      } else {
        // Construct the number 'two hundred', 'three hundred', etc.
        let digit = hundreds / 100;
        numberSoundChain = this._createChainableSound(this._getUrlForNumber(digit), digit)
          .then(()=> {
            return this._createChainableSound(POINTS_SOUNDS.hundred, 'hundred');
          });
      }

      // Remove the hundreds digit so we can process the rest.
      powers.shift();
    } else {
      numberSoundChain = Promise.resolve();
    }

    // Add the rest of the numbers.
    while (powers.length) {
      let digit = powers.shift();
      // Skip if 0
      if (digit) {
        numberSoundChain = numberSoundChain.then(()=> {
          return this._createChainableSound(this._getUrlForNumber(digit), digit);
        });
      }
    }

    return numberSoundChain;
  }

  _getUrlForNumber(number) {
    return POINTS_SOUNDS[Math.abs(number)];
  }

  _numberToPowers(number) {
    // From https://stackoverflow.com/questions/34110725/convert-number-to-tens-hundreds-thousands
    var digits = number.toString().split('');
    return digits.map(function(digit, n) {
      return digit * Math.pow(10, digits.length - n - 1);
    });
  }

  _serviceQueue() {
    // Take the next award off the queue.
    this.running = false;
    if (this.pointsQueue.length) {
      const next = this.pointsQueue.shift();
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
