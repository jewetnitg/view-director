import _ from 'lodash';

import StaticView from '../../../src/factories/StaticView';
import ObjectWithViewAndMiddleware from '../../../src/factories/ObjectWithViewAndMiddleware';

import {Adapter, View, riotAdapter, reactAdapter} from 'frontend-view';

const originalValues = {
  viewDefaults: View.defaults,
  adapterDefaults: Adapter.defaults,
  staticViewDefaults: StaticView.defaults
};

describe(`StaticView`, () => {

  let baseStaticView = null;

  function resetMocks() {
    resetInstances();
    resetDefaults();
    Adapter.adapters.riot = {
      name: 'riot',
      render: function () {
      }
    };
    View.viewOptions.testView = {
      name: 'testView',
      template: function () {
      }
    };

    baseStaticView = {
      name: 'test',
      view: 'testView',
      viewDirector: {}
    };
  }

  function resetInstances() {
    StaticView.staticViews = {};
    Adapter.adapters = {};
    View.views = {};
    View.viewOptions = {};
  }

  function resetDefaults() {
    View.defaults = originalValues.viewDefaults;
    StaticView.defaults = originalValues.staticViewDefaults;
    Adapter.defaults = originalValues.adapterDefaults;
  }

  beforeEach(done => {
    resetMocks();
    done();
  });

  it(`should be a function`, done => {
    expect(StaticView).to.be.a('function');
    done();
  });

  it(`should extend ObjectWithViewAndMiddleware`, done => {
    expect(StaticView(baseStaticView)).to.be.an.instanceOf(ObjectWithViewAndMiddleware);
    done();
  });

  describe(`const staticView = StaticView(Object options)`, () => {

    it(`should return an instance of StaticView`, done => {
      expect(StaticView(baseStaticView)).to.be.an.instanceOf(StaticView);
      done();
    });

    it(`should throw an error if a StaticView with the provided name already exists or no name is provided at all`, done => {

      function constructStaticViewWithoutName() {
        StaticView({
          viewDirector: {},
          view: 'testView'
        });
      }

      function constructTestStaticView() {
        StaticView({
          name: 'test',
          viewDirector: {},
          view: 'testView'
        });
      }

      expect(constructStaticViewWithoutName).to.throw(Error);

      expect(constructTestStaticView).to.not.throw(Error);
      expect(constructTestStaticView).to.throw(Error);

      done();
    });

    it(`should add itself to StaticView.staticViews`, done => {
      const staticView = StaticView(baseStaticView);

      expect(StaticView.staticViews.test).to.equal(staticView);
      done();
    });

  });

});