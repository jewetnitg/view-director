import _ from 'lodash';

import ViewDirector from '../../../src/factories/ViewDirector';
import StaticView from '../../../src/factories/StaticView';
import Composition from '../../../src/factories/Composition';

import {Adapter, View, riotAdapter, reactAdapter, handlebarsAdapter} from 'frontend-view';

const originalValues = {
  viewDefaults: View.defaults,
  adapterDefaults: Adapter.defaults,
  staticViewDefaults: StaticView.defaults,
  compositionDefaults: Composition.defaults
};

describe(`ViewDirector`, () => {

  function resetMocks() {
    resetInstances();
    resetDefaults();
  }

  function resetInstances() {
    ViewDirector.constructed = false;
    StaticView.staticViews = {};
    Adapter.adapters = {};
    View.views = {};
    View.viewOptions = {};
    Composition.compositions = {};
  }

  function resetDefaults() {
    View.defaults = originalValues.viewDefaults;
    StaticView.defaults = originalValues.staticViewDefaults;
    Composition.defaults = originalValues.compositionDefaults;
    Adapter.defaults = originalValues.adapterDefaults;
  }

  beforeEach(done => {
    resetMocks();
    done();
  });

  it(`should be a function`, done => {
    expect(ViewDirector).to.be.a('function');
    done();
  });

  describe(`const viewDirector = ViewDirector(Object options)`, () => {

    it(`should return an instance of ViewDirector`, done => {
      expect(ViewDirector()).to.be.an.instanceOf(ViewDirector);
      done();
    });

    it(`should throw an error if more than one an instance is constructed`, done => {
      function tryToConstructTwoViewDirectors() {
        ViewDirector();
        ViewDirector();
      }

      expect(tryToConstructTwoViewDirectors).to.throw(Error);

      done();
    });

    it.skip(`should construct a data and security MiddlewareRunner and pass it the data and security middleware respectively`, done => {
      done();
    });

    // SETTING DEFAULTS

    it(`should set View defaults`, done => {
      const testDefaultProp = 'val';

      ViewDirector({
        config: {
          views: {
            testDefaultProp
          }
        }
      });

      expect(View.defaults.testDefaultProp).to.equal(testDefaultProp);

      done();
    });

    it(`should set StaticView defaults`, done => {
      const testDefaultProp = 'val';

      const viewDirector = ViewDirector({
        config: {
          staticViews: {
            testDefaultProp
          }
        }
      });

      expect(StaticView.defaults.testDefaultProp).to.equal(testDefaultProp);
      expect(StaticView.defaults.viewDirector).to.equal(viewDirector);

      done();
    });

    it(`should set Adapter defaults`, done => {
      const testDefaultProp = 'val';

      ViewDirector({
        config: {
          adapters: {
            testDefaultProp
          }
        }
      });

      expect(Adapter.defaults.testDefaultProp).to.equal(testDefaultProp);

      done();
    });

    it(`should set Composition defaults`, done => {
      const testDefaultProp = 'val';

      const viewDirector = ViewDirector({
        config: {
          compositions: {
            testDefaultProp
          }
        }
      });

      expect(Composition.defaults.testDefaultProp).to.equal(testDefaultProp);
      expect(Composition.defaults.viewDirector).to.equal(viewDirector);

      done();
    });

    it(`should set reactAdapter libraries`, done => {
      const libraries = {
        react: {},
        'react-dom': {}
      };

      ViewDirector({
        libraries
      });

      expect(reactAdapter.React).to.equal(libraries.react);
      expect(reactAdapter.ReactDOM).to.equal(libraries['react-dom']);

      done();
    });

    it(`should set riotAdapter library`, done => {
      const libraries = {
        riot: {}
      };

      ViewDirector({
        libraries
      });

      expect(riotAdapter.riot).to.equal(libraries.riot);

      done();
    });

    // CONSTRUCTING ENTITIES

    it(`should construct the react -, riot - and handlebars Adapters`, done => {
      ViewDirector();
      expect(Adapter.adapters.react.options).to.equal(reactAdapter);
      expect(Adapter.adapters.riot.options).to.equal(riotAdapter);
      expect(Adapter.adapters.handlebars.options).to.equal(handlebarsAdapter);
      done();
    });

    it(`should construct Adapters provided in the options`, done => {
      const testAdapter = {
        name: 'test',
        render() {
        }
      };
      ViewDirector({
        adapters: {
          test: testAdapter
        }
      });
      expect(Adapter.adapters.test.options).to.equal(testAdapter);
      done();
    });

    it(`should register the Views provided in the options`, done => {
      const testView = {};
      const register = View.register;

      View.register = mockFunction();

      ViewDirector({
        views: {
          test: testView
        }
      });

      verify(View.register)(testView);

      View.register = register;

      done();
    });

    it(`should construct the StaticViews provided in the options`, done => {
      const testStaticView = {
        name: 'test',
        viewDirector: {},
        view: 'testView'
      };

      View.viewOptions.testView = {
        name: 'testView',
        template() {
        }
      };

      ViewDirector({
        staticViews: {
          test: testStaticView
        }
      });

      expect(StaticView.staticViews.test.options).to.equal(testStaticView);

      done();
    });

    it(`should construct the Compositions provided in the options`, done => {
      const testComposition = {
        route: 'test',
        viewDirector: {},
        view: 'testView'
      };

      View.viewOptions.testView = {
        name: 'testView',
        template() {
        }
      };

      ViewDirector({
        compositions: {
          test: testComposition
        }
      });

      expect(Composition.compositions.test.options).to.equal(testComposition);

      done();
    });

    describe(`viewDirector.setComposition(Composition|Object|String composition, Object params, Object data)`, () => {

      it(`should hide the current composition`, done => {
        const viewDirector = ViewDirector();
        const composition = {
          render: mockFunction()
        };
        const ensure = Composition.ensure;
        Composition.ensure = mockFunction();

        when(Composition.ensure)()
          .thenReturn(composition);

        when(composition.render)()
          .thenReturn(Promise.resolve());

        viewDirector.hide = mockFunction();

        viewDirector.setComposition();

        verify(viewDirector.hide)();

        Composition.ensure = ensure;

        done();
      });

      it(`should ensure a Composition`, done => {
        const viewDirector = ViewDirector();
        const compositionObjectUsedToEnsure = {};
        const composition = {
          render: mockFunction()
        };
        const ensure = Composition.ensure;
        Composition.ensure = mockFunction();

        when(Composition.ensure)(compositionObjectUsedToEnsure)
          .thenReturn(composition);

        when(composition.render)()
          .thenReturn(Promise.resolve());

        viewDirector.setComposition(compositionObjectUsedToEnsure);

        verify(Composition.ensure)(compositionObjectUsedToEnsure);

        Composition.ensure = ensure;

        done();
      });

      it(`should render the composition, passing it the passed in params and data`, done => {
        const viewDirector = ViewDirector();

        const params = {};
        const data = {};

        const composition = {
          render: mockFunction()
        };

        const ensure = Composition.ensure;
        Composition.ensure = mockFunction();

        when(Composition.ensure)()
          .thenReturn(composition);

        when(composition.render)()
          .thenReturn(Promise.resolve());

        viewDirector.setComposition('a', params, data);

        verify(composition.render)(params, data);

        Composition.ensure = ensure;

        done();
      });

      it(`should return the value returned by Composition#render`, done => {
        const viewDirector = ViewDirector();

        const composition = {
          render: mockFunction()
        };
        const renderReturnValue = {};

        const ensure = Composition.ensure;
        Composition.ensure = mockFunction();

        when(Composition.ensure)()
          .thenReturn(composition);

        when(composition.render)()
          .thenReturn(renderReturnValue);

        expect(viewDirector.setComposition()).to.equal(renderReturnValue);

        Composition.ensure = ensure;

        done();
      });

    });

    describe(`viewDirector.hide()`, () => {

      it(`should hide the current composition if there is one`, done => {
        const viewDirector = ViewDirector();
        viewDirector.state.composition = {
          hide: mockFunction()
        };

        viewDirector.hide();

        verify(viewDirector.state.composition.hide)();

        done();
      });

    });

    describe(`viewDirector.show()`, () => {

      it(`should show the current composition if there is one`, done => {
        const viewDirector = ViewDirector();
        viewDirector.state.composition = {
          show: mockFunction()
        };

        viewDirector.show();

        verify(viewDirector.state.composition.show)();

        done();
      });

    });

    describe(`viewDirector.sync(Object data)`, () => {

      it(`should sync the current composition if there is one`, done => {
        const viewDirector = ViewDirector();
        const data = {};
        viewDirector.state.composition = {
          sync: mockFunction()
        };

        viewDirector.sync(data);

        verify(viewDirector.state.composition.sync)(data);

        done();
      });

    });

    describe(`viewDirector.data(Array<String> middleware, Object params, Object data, Function sync, Function destruct)`, () => {

      it(`should execute the data MiddlewareRunner with the arguments provided and return its value`, done => {
        const viewDirector = ViewDirector();
        const middleware = {};
        const params = {};
        const data = {};
        const sync = {};
        const destruct = {};

        viewDirector.middleware.data = {
          execute: mockFunction()
        };

        viewDirector.data(middleware, params, data, sync, destruct);

        verify(viewDirector.middleware.data.execute)(middleware, params, data, sync, destruct);

        done();
      });

    });

    describe(`viewDirector.security(Array<String> middleware, Object params)`, () => {

      it(`should execute the security MiddlewareRunner with the arguments provided and return its value`, done => {
        const viewDirector = ViewDirector();
        const middleware = {};
        const params = {};

        viewDirector.middleware.security = {
          execute: mockFunction()
        };

        viewDirector.security(middleware, params);

        verify(viewDirector.middleware.security.execute)(middleware, params);

        done();
      });

    });


  });

});