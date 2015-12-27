import _ from 'lodash';
import ViewDirector from '../../src/factories/ViewDirector';

describe(`ViewDirector`, () => {

  it(`should be a function`, (done) => {
    expect(ViewDirector).to.be.a('function');
    done();
  });

  describe(`const viewDirector = ViewDirector(Object options)`, () => {

    it(`should return an instance of Runner`, (done) => {
      expect(ViewDirector()).to.be.an.instanceOf(ViewDirector);
      done();
    });

  });

});