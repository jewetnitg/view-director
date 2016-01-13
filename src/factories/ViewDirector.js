import _ from 'lodash';
import FactoryFactory from 'frontend-factory';
import Composition from './Composition';
import StaticView from './StaticView';
import ensure from '../helpers/ensure';

import MiddlewareRunner from 'frontend-middleware';

import {
  View,
  Adapter,
  riotAdapter,
  reactAdapter,
  handlebarsAdapter
} from 'frontend-view';

/**
 *
 * @todo document
 * @todo apply defaults for all classes
 * @todo refactor to use helpers/ensure instead of constructType
 * @class ViewDirector
 */
const ViewDirector = FactoryFactory({

  name: 'ViewDirector',

  validate() {
    if (ViewDirector.constructed) {
      throw new Error(`Only one ViewDirector can be constructed.`);
    }
  },

  defaults: {
    holder: '.current-view',
    session: {},
    middleware: {},
    libraries: {},
    config: {
      views: {},
      compositions: {},
      adapters: {},
      staticViews: {}
    }
  },

  props(options = {}) {
    return {
      session: {
        value: options.session
      },
      state: {
        value: {
          composition: null
        }
      },
      middleware: {
        value: {
          data: MiddlewareRunner({
            middleware: options.middleware.data,
            session: options.session
          }),
          security: MiddlewareRunner({
            middleware: options.middleware.security,
            session: options.session
          })
        }
      }
    }
  },

  initialize() {
    setDefaults(this);
    constructEntities(this);
    ViewDirector.constructed = true;
  },

  prototype: {

    /**
     * @todo document
     * @param composition
     * @param params
     * @param data
     * @returns {Promise}
     */
    setComposition(composition, params = {}, data = {}) {
      this.hide();

      if (this.state.composition && this.state.composition.executionContext) {
        this.state.composition.executionContext.destroy();
      }

      this.state.composition = Composition.ensure(composition);

      return this.state.composition.render(params, data);
      return this.state.composition.executionContext(params, data);
    },

    /**
     * @todo document
     */
    hide() {
      if (this.state.composition) {
        this.state.composition.hide();
      }
    },

    /**
     * @todo document
     */
    show() {
      if (this.state.composition) {
        this.state.composition.show();
      }
    },

    /**
     * @todo document
     * @param data
     */
    sync(data = {}) {
      if (this.state.composition) {
        this.state.composition.sync(data);
      }
    },

    /**
     * @todo document
     * @param middleware
     * @param params
     * @param data
     * @param sync
     * @param destruct
     * @returns {*|Promise}
     */
    data(middleware = [], params = {}, data = {}, sync, destruct) {
      return this.middleware.data.execute(middleware, params, data, sync, destruct);
    },

    /**
     * @todo document
     * @param middleware
     * @param params
     * @returns {*|Promise}
     */
    security(middleware = [], params = {}) {
      return this.middleware.security.execute(middleware, params);
    }

  }

});

ViewDirector.constructed = false;

function setDefaults(viewDirector) {
  // set defaults on factories, so instances get these defaults
  Object.assign(View.defaults, viewDirector.options.config.views);
  Object.assign(StaticView.defaults, viewDirector.options.config.staticViews);
  Object.assign(Adapter.defaults, viewDirector.options.config.adapters);
  Object.assign(Composition.defaults, viewDirector.options.config.compositions);

  StaticView.defaults.viewDirector = viewDirector;
  Composition.defaults.viewDirector = viewDirector;

  // set libraries on adapters so only one instance of the library is used
  if (viewDirector.options.libraries.riot) {
    riotAdapter.riot = viewDirector.options.libraries.riot;
  }

  if (viewDirector.options.libraries.react) {
    reactAdapter.React = viewDirector.options.libraries.react;
  }

  if (viewDirector.options.libraries['react-dom']) {
    reactAdapter.ReactDOM = viewDirector.options.libraries['react-dom'];
  }
}

function constructEntities(viewDirector) {
  // construct provided adapters
  constructType(Adapter, {
    react: reactAdapter,
    riot: riotAdapter,
    handlebars: handlebarsAdapter
  });
  constructType(Adapter, viewDirector.options.adapters);

  _.each(viewDirector.options.views, (viewOptions, name) => {
    viewOptions.name = viewOptions.name || name;
    View.register(viewOptions);
  });

  constructType(StaticView, viewDirector.options.staticViews);
  constructType(Composition, viewDirector.options.compositions);
}

function constructType(factory, hashmap, identifier = "name") {
  _.each(hashmap, (options = {}, identity) => {
    options[identifier] = options[identifier] || identity;
    factory(options);
  });
}

export default ViewDirector;