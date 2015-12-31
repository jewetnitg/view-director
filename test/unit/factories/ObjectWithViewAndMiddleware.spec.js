import _ from 'lodash';

import ObjectWithViewAndMiddleware from '../../../src/factories/ObjectWithViewAndMiddleware';

import {Adapter, View, ObjectWithView, riotAdapter, reactAdapter} from 'frontend-view';

const originalValues = {
  viewDefaults: View.defaults,
  adapterDefaults: Adapter.defaults
};

describe(`ObjectWithViewAndMiddleware`, () => {

  let baseObjectWithViewAndMiddleware = null;

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

    baseObjectWithViewAndMiddleware = {
      view: 'testView',
      viewDirector: {
        data(middleware, params, data, sync, destruct) {
          return Promise.resolve();
        },
        security(middleware, params, data, sync, destruct) {
          return Promise.resolve();
        }
      }
    };
  }

  function resetInstances() {
    Adapter.adapters = {};
    View.views = {};
    View.viewOptions = {};
  }

  function resetDefaults() {
    View.defaults = originalValues.viewDefaults;
    Adapter.defaults = originalValues.adapterDefaults;
  }

  beforeEach(done => {
    resetMocks();
    done();
  });

  it(`should be a function`, done => {
    expect(ObjectWithViewAndMiddleware).to.be.a('function');
    done();
  });

  it(`should extend ObjectWithView`, done => {
    expect(ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware)).to.be.an.instanceOf(ObjectWithView);
    done();
  });

  describe(`const objectWithViewAndMiddleware = ObjectWithViewAndMiddleware(Object options)`, () => {

    it(`should return an instance of ObjectWithViewAndMiddleware`, done => {
      expect(ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware)).to.be.an.instanceOf(ObjectWithViewAndMiddleware);
      done();
    });

    it(`should throw an error if no viewDirector is provided when constructing`, done => {
      function tryToConstructObjectWithViewAndMiddlewareWithoutViewDirector() {
        baseObjectWithViewAndMiddleware.viewDirector = null;
        ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
      }

      expect(tryToConstructObjectWithViewAndMiddlewareWithoutViewDirector).to.throw(Error);

      done();
    });

    describe(`Promise objectWithMiddlewareAndView.middleware(Object params, Object data)`, () => {

      it(`should return a Promise`, done => {
        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        expect(objectWithMiddlewareAndView.middleware()).to.be.an.instanceOf(Promise);
        done();
      });

      it(`should run this ObjectWithViewAndMiddlewares security using the viewDirector provided when this ObjectWithViewAndMiddleware was constructed`, done => {
        const params = {};
        const security = baseObjectWithViewAndMiddleware.security = [''];

        baseObjectWithViewAndMiddleware.viewDirector.security = mockFunction();
        when(baseObjectWithViewAndMiddleware.viewDirector.security)()
          .then(Promise.resolve.bind(Promise));

        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        objectWithMiddlewareAndView.middleware(params);

        verify(baseObjectWithViewAndMiddleware.viewDirector.security)(security, params);

        done();
      });

      it(`should run this ObjectWithViewAndMiddlewares data middleware using its viewDirector and resolve with the value resolved by executing the middleware`, done => {
        const dataMiddleware = baseObjectWithViewAndMiddleware.data = [''];
        const data = {};
        const params = {};
        const resolveData = {};

        baseObjectWithViewAndMiddleware.viewDirector.security = mockFunction();
        baseObjectWithViewAndMiddleware.viewDirector.data = mockFunction();

        when(baseObjectWithViewAndMiddleware.viewDirector.security)()
          .thenReturn(Promise.resolve());

        when(baseObjectWithViewAndMiddleware.viewDirector.data)()
          .thenReturn(Promise.resolve(resolveData));

        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        objectWithMiddlewareAndView.middleware(params, data)
          .then((_data) => {
            verify(baseObjectWithViewAndMiddleware.viewDirector.data)(dataMiddleware, params, data);
            expect(_data).to.equal(resolveData);
            done();
          });
      });

      it(`should reject with error code 403 and the rejected data if security fails`, done => {
        const params = {};
        const error = {};
        baseObjectWithViewAndMiddleware.viewDirector.security = mockFunction();
        when(baseObjectWithViewAndMiddleware.viewDirector.security)()
          .thenReturn(Promise.reject(error));

        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        objectWithMiddlewareAndView.middleware(params)
          .catch(err => {
            expect(err.code).to.equal(403);
            expect(err.error).to.equal(error);
            done();
          });
      });

      it(`should reject with error code 500 and the rejected data if data fails`, done => {
        const params = {};
        const error = {};

        baseObjectWithViewAndMiddleware.viewDirector.security = mockFunction();
        baseObjectWithViewAndMiddleware.viewDirector.data = mockFunction();

        when(baseObjectWithViewAndMiddleware.viewDirector.security)()
          .thenReturn(Promise.resolve());

        when(baseObjectWithViewAndMiddleware.viewDirector.data)()
          .thenReturn(Promise.reject(error));

        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        objectWithMiddlewareAndView.middleware(params)
          .catch(err => {
            expect(err.code).to.equal(500);
            expect(err.error).to.equal(error);
            done();
          });
      });

    });

    describe(`Promise objectWithViewAndMiddleware.render(Object params, Object data, Boolean force = false)`, () => {

      // @todo fix this throws an error, TypeError: undefined is not an object evaluating 'this.el.style'
      it.skip(`should return a Promise`, done => {
        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        const render = ObjectWithView.prototype.render;
        const renderMock = mockFunction();
        expect(objectWithMiddlewareAndView.render()).to.be.an.instanceOf(Promise);

        ObjectWithView.prototype.render = render;
        done();
      });

      it(`should render itself using the render method as defined on the ObjectWithView prototype with data acquired from the middleware function and the provided force argument`, done => {
        const params = {};
        const data = {};
        const force = {};

        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        const middlewareData = {};

        const render = ObjectWithView.prototype.render;
        const renderMock = mockFunction();


        objectWithMiddlewareAndView.middleware = mockFunction();
        objectWithMiddlewareAndView.hide = mockFunction();

        ObjectWithView.prototype.render = function (params, data, force) {
          expect(this).to.equal(objectWithMiddlewareAndView);
          return renderMock(params, data, force);
        };

        when(objectWithMiddlewareAndView.middleware)()
          .thenReturn(Promise.resolve(middlewareData));

        objectWithMiddlewareAndView.render(params, data, force)
          .then(() => {
            verify(renderMock)(middlewareData, force);
            ObjectWithView.prototype.render = render;
            done();
          });
      });

      it(`should hide itself if the render fails to execute and return a rejecting Promise with the data the middleware function rejected with`, done => {
        const objectWithMiddlewareAndView = ObjectWithViewAndMiddleware(baseObjectWithViewAndMiddleware);
        const error = {};

        objectWithMiddlewareAndView.middleware = mockFunction();
        objectWithMiddlewareAndView.hide = mockFunction();

        when(objectWithMiddlewareAndView.middleware)()
          .thenReturn(Promise.reject(error));

        objectWithMiddlewareAndView.render()
          .catch((err) => {
            expect(err).to.equal(error);
            verify(objectWithMiddlewareAndView.hide)();
            done();
          });
      });

    });

  });

});