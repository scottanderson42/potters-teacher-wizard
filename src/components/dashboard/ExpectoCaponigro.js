import _ from 'lodash';
import {Howl} from 'howler';

import SoundGryffindor from '../../assets/sounds/gryffindor.mp3';
import SoundHufflepuff from '../../assets/sounds/hufflepuff.mp3';
import SoundRavenclaw from '../../assets/sounds/ravenclaw.mp3';
import SoundSlytherin from '../../assets/sounds/slytherin.mp3';

const HOUSE_SOUNDS = {
  gryffindor: SoundGryffindor,
  hufflepuff: SoundHufflepuff,
  ravenclaw: SoundRavenclaw,
  slytherin: SoundSlytherin
}

class ExpectoCaponigro {
  constructor() {
    this.pointsQueue = [];
  }

  addPoints(house, points) {
    let houseSound = new Howl({
      src: [HOUSE_SOUNDS[house]]
    });
    houseSound.play();
  }
}

export default ExpectoCaponigro;
