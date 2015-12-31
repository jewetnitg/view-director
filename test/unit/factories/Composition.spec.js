import _ from 'lodash';

import Composition from '../../../src/factories/Composition';
import StaticView from '../../../src/factories/StaticView';
import ObjectWithViewAndMiddleware from '../../../src/factories/ObjectWithViewAndMiddleware';

import {Adapter, View, riotAdapter, reactAdapter} from 'frontend-view';

const originalValues = {
  viewDefaults: View.defaults,
  adapterDefaults: Adapter.defaults,
  staticViewDefaults: StaticView.defaults,
  compositionDefaults: Composition.defaults
};

describe(`ViewDirector`, () => {

  let baseComposition = null;

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

    baseComposition = {
      view: 'testView',
      route: 'test',
      viewDirector: {}
    };
  }

  function resetInstances() {
    Composition.constructed = false;
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
    expect(Composition).to.be.a('function');
    done();
  });

  it(`should extend ObjectWithViewAndMiddleware`, done => {
    expect(Composition(baseComposition)).to.be.an.instanceOf(ObjectWithViewAndMiddleware);
    done();
  });

  describe(`const composition = Composition(Object options)`, () => {

    it(`should return an instance of Composition`, done => {
      expect(Composition(baseComposition)).to.be.an.instanceOf(Composition);
      done();
    });

    it(`should throw an error if constructed without a route, view or viewDirector`, done => {
      function tryToConstructCompositionWithoutView() {
        resetMocks();
        baseComposition.view = null;
        Composition(baseComposition);
      }

      function tryToConstructCompositionWithoutViewDirector() {
        resetMocks();
        baseComposition.viewDirector = null;
        Composition(baseComposition);
      }

      function tryToConstructCompositionWithoutRoute() {
        resetMocks();
        baseComposition.route = null;
        Composition(baseComposition);
      }

      expect(tryToConstructCompositionWithoutView).to.throw(Error);
      expect(tryToConstructCompositionWithoutViewDirector).to.throw(Error);
      expect(tryToConstructCompositionWithoutRoute).to.throw(Error);

      done();
    });

    it(`should set options.name to options.route if not provided`, done => {
      expect(baseComposition.name).to.not.equal(baseComposition.route);
      Composition(baseComposition);
      expect(baseComposition.name).to.equal(baseComposition.route);
      done();
    });

    it(`should add itself to Composition.compositions by name`, done => {
      const composition = Composition(baseComposition);
      expect(Composition.compositions[baseComposition.name]).to.equal(composition);
      done();
    });

    describe(`composition.render(Object params, Object data, Boolean force)`, () => {

      it(`should render its view using the ObjectWithViewAndMiddleware render method`, done => {
        const composition = Composition(baseComposition);

        const params = {};
        const data = {};
        const force = {};

        const render = ObjectWithViewAndMiddleware.prototype.render;
        const renderMock = mockFunction();
        ObjectWithViewAndMiddleware.prototype.render = function (params, data, force) {
          expect(this).to.equal(composition);
          return renderMock(params, data, force);
        };

        when(renderMock)()
          .thenReturn(Promise.resolve());

        composition.render(params, data, force);

        verify(renderMock)(params, data, force);

        ObjectWithViewAndMiddleware.prototype.render = render;
        done();
      });

      it(`should render its staticViews`, done => {
        const composition = Composition(baseComposition);

        const params = {};
        const data = {};
        const force = {};

        const render = ObjectWithViewAndMiddleware.prototype.render;
        ObjectWithViewAndMiddleware.prototype.render = Promise.resolve.bind(Promise);

        const renderMock = mockFunction();

        when(renderMock)()
          .thenReturn(Promise.resolve());
        StaticView.staticViews.test = {
          render: renderMock
        };
        composition.staticViews = ['test'];

        composition.render(params, data, force);

        verify(renderMock)(params, data, force);

        ObjectWithViewAndMiddleware.prototype.render = render;

        done()
      });

      it(`should return a Promise`, done => {
        const composition = Composition(baseComposition);

        const render = ObjectWithViewAndMiddleware.prototype.render;
        ObjectWithViewAndMiddleware.prototype.render = Promise.resolve.bind(Promise);

        expect(composition.render()).to.be.an.instanceOf(Promise);

        ObjectWithViewAndMiddleware.prototype.render = render;

        done()
      });

    });

    describe(`composition.sync(Object data)`, () => {

      it(`should sync its view using the ObjectWithViewAndMiddleware sync method`, done => {
        const composition = Composition(baseComposition);
        const data = {};

        const syncMock = mockFunction();
        const sync = ObjectWithViewAndMiddleware.prototype.sync;
        ObjectWithViewAndMiddleware.prototype.sync = function (_data) {
          expect(this).to.equal(composition);
          syncMock(_data);
        };

        composition.sync(data);

        verify(syncMock)(data);

        ObjectWithViewAndMiddleware.prototype.sync = sync;
        done();
      });

      it(`should sync its staticViews`, done => {
        const composition = Composition(baseComposition);
        const data = {};

        const syncMock = mockFunction();

        const syncStaticView = StaticView.prototype.sync;
        const sync = ObjectWithViewAndMiddleware.prototype.sync;

        StaticView.prototype.sync = syncMock;
        ObjectWithViewAndMiddleware.prototype.sync = Promise.resolve.bind(Promise);

        StaticView.staticViews.test = {
          sync: syncMock
        };

        composition.staticViews = ['test'];

        composition.sync(data);

        verify(syncMock)(data);

        ObjectWithViewAndMiddleware.prototype.sync = sync;
        StaticView.prototype.sync = syncStaticView;

        done();
      });

    });

    describe(`composition.show()`, () => {

      it(`should show its view using the ObjectWithViewAndMiddleware show method`, done => {
        const composition = Composition(baseComposition);

        const showMock = mockFunction();
        const show = ObjectWithViewAndMiddleware.prototype.show;
        ObjectWithViewAndMiddleware.prototype.show = function () {
          expect(this).to.equal(composition);
          showMock();
        };

        composition.show();

        verify(showMock)();

        ObjectWithViewAndMiddleware.prototype.show = show;

        done();
      });

      it(`should show its staticViews`, done => {
        const composition = Composition(baseComposition);

        const showMock = mockFunction();

        const showStaticView = StaticView.prototype.show;
        const show = ObjectWithViewAndMiddleware.prototype.show;

        StaticView.prototype.show = showMock;
        ObjectWithViewAndMiddleware.prototype.show = Promise.resolve.bind(Promise);

        StaticView.staticViews.test = {
          show: showMock
        };

        composition.staticViews = ['test'];

        composition.show();

        verify(showMock)();

        ObjectWithViewAndMiddleware.prototype.show = show;
        StaticView.prototype.show = showStaticView;

        done();
      });

    });

    describe(`composition.hide()`, () => {

      it(`should hide its view using the ObjectWithViewAndMiddleware hide method`, done => {
        const composition = Composition(baseComposition);

        const hideMock = mockFunction();
        const hide = ObjectWithViewAndMiddleware.prototype.hide;
        ObjectWithViewAndMiddleware.prototype.hide = function () {
          expect(this).to.equal(composition);
          hideMock();
        };

        composition.hide();

        verify(hideMock)();

        ObjectWithViewAndMiddleware.prototype.hide = hide;

        done();
      });

      it(`should hide its staticViews`, done => {
        const composition = Composition(baseComposition);

        const hideMock = mockFunction();

        const hideStaticView = StaticView.prototype.hide;
        const hide = ObjectWithViewAndMiddleware.prototype.hide;

        StaticView.prototype.hide = hideMock;
        ObjectWithViewAndMiddleware.prototype.hide = Promise.resolve.bind(Promise);

        StaticView.staticViews.test = {
          hide: hideMock
        };

        composition.staticViews = ['test'];

        composition.hide();

        verify(hideMock)();

        ObjectWithViewAndMiddleware.prototype.hide = hide;
        StaticView.prototype.hide = hideStaticView;

        done();
      });

    });

  });

  describe(`const composition = Composition.ensure(Object|String|Composition composition)`, () => {

    it(`should try to find a Composition by name if a string is provided and throw an Error if none can be found`, done => {
      const compositionName = 'test';
      const composition = Composition.compositions[compositionName] = {};
      const ensuredComposition = Composition.ensure(compositionName);

      function tryToEnsureCompositionWithAnInvalidName() {
        Composition.ensure('rgrsgsrgvrsg');
      }

      expect(ensuredComposition).to.equal(composition);
      expect(tryToEnsureCompositionWithAnInvalidName).to.throw(Error);

      done();
    });

    it(`should try to find a Composition by options properties if an object is provided and create a new Composition if none can be found`, done => {
      const compositionName = 'test';
      const composition = Composition.compositions[compositionName] = {
        options: {
          someProperty: 'someValue'
        }
      };

      const ensuredComposition = Composition.ensure({
        someProperty: 'someValue'
      });

      const ensureCompositionThatDidNotExist = Composition.ensure({
        route: 'ay',
        view: 'testView',
        viewDirector: {},
        blaBla: 'asd'
      });

      expect(ensuredComposition).to.equal(composition);
      expect(ensureCompositionThatDidNotExist).to.not.equal(composition);

      expect(ensureCompositionThatDidNotExist).to.be.an.instanceOf(Composition);

      done();
    });

    it(`should return the provided Composition if a Composition was provided`, done => {
      const composition = Composition(baseComposition);
      const ensuredComposition = Composition.ensure(composition);

      expect(ensuredComposition).to.equal(composition);

      done();
    });

    it(`should throw an Error if the provided argument was not a string, object or Composition`, done => {
      function tryToEnsureCompositionWithoutPassingAnyArguments() {
        Composition.ensure();
      }

      function tryToEnsureCompositionByPassingItAnInvalidArgument() {
        Composition.ensure(3);
      }

      expect(tryToEnsureCompositionWithoutPassingAnyArguments).to.throw(Error);
      expect(tryToEnsureCompositionByPassingItAnInvalidArgument).to.throw(Error);

      done();
    });

  });

});