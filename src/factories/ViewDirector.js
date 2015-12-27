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

  defaults: {
    holder: '.current-view',
    session: {},
    middleware: {},
    libraries: {},
    config: {
      views: {},
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
    if (this.options.config.views) {
      Object.assign(View.defaults, this.options.config.views);
    }

    if (this.options.config.staticViews) {
      Object.assign(StaticView.defaults, this.options.config.staticViews);
    }

    // set libraries on adapters so only one instance of the library is used
    if (this.options.libraries.riot) {
      riotAdapter.riot = this.options.libraries.riot;
    }

    if (this.options.libraries.react) {
      reactAdapter.React = this.options.libraries.react;
    }

    if (this.options.libraries['react-dom']) {
      reactAdapter.ReactDOM = this.options.libraries['react-dom'];
    }

    // @todo set defaults for Adapter and Composition

    // construct provided adapters
    constructType(this.Adapter.bind(this), {
      react: reactAdapter,
      riot: riotAdapter,
      handlebars: handlebarsAdapter
    });
    constructType(this.Adapter.bind(this), this.options.adapters);

    _.each(this.options.views, (viewOptions, name) => {
      viewOptions.name = viewOptions.name || name;
      View.register(viewOptions);
    });

    constructType(this.StaticView.bind(this), this.options.staticViews);
    constructType(this.Composition.bind(this), this.options.compositions);
  },

  prototype: {

    /**
     * @todo document
     * @returns {Object<Object<Array<View>>>}
     */
    get views() {
      return View.views;
    },

    /**
     * @todo document
     * @returns {Object<Adapter>}
     */
    get adapters() {
      return Adapter.adapters;
    },

    /**
     * @todo document
     * @returns {Object<StaticView>}
     */
    get staticViews() {
      return StaticView.staticViews;
    },

    /**
     * @todo document
     * @returns {Object<Composition>}
     */
    get compositions() {
      return Composition.compositions;
    },

    /**
     * @todo document
     * @param options
     * @returns {*}
     * @constructor
     */
    View(options = {}) {
      _.defaults(options, this.options.config.views);
      return this.views[options.name] = View(options);
    },

    /**
     * @todo document
     * @param options
     * @constructor
     */
    Adapter(options = {}) {
      return Adapter(options);
    },

    /**
     * @todo document
     * @param options
     * @returns {*}
     * @constructor
     */
    StaticView(options = {}) {
      _.defaults(options, this.options.config.staticViews);
      options.viewDirector = this;
      return this.staticViews[options.name] = StaticView(options);
    },

    /**
     * @todo document
     * @param options
     * @returns {*}
     * @constructor
     */
    Composition(options = {}) {
      options.viewDirector = this;
      return this.compositions[options.name || options.route] = Composition(options);
    },

    /**
     * @todo document
     * @param composition
     * @param params
     * @param data
     * @returns {Promise}
     */
    setComposition(composition, params = {}, data = {}) {
      this.hide();
      this.state.composition = ensureComposition.call(this, composition);
      return this.state.composition.render(params, data)
        .then(() => {
          this.show();
        })
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
      } else {
        return Promise.reject(`Can't sync, no current composition`);
      }
    },

    /**
     * @todo document
     */
    ensureAdapter(adapter) {
      return ensure('Adapter', this.options.adapters, this.Adapter.bind(this), adapter, this.adapters);
    },

    /**
     * @todo document
     */
    ensureView(view) {
      return ensure('View', this.options.views, this.View.bind(this), view, View.views);
    },

    /**
     * @todo document
     */
    ensureStaticView(staticViewName) {
      return ensure(
        'StaticView',
        this.options.staticViews,
        this.StaticView.bind(this),
        staticViewName,
        this.staticViews
      );
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

function constructType(factory, hashmap, identifier = "name") {
  _.each(hashmap, (options = {}, identity) => {
    options[identifier] = options[identifier] || identity;
    factory(options);
  });
}

function ensureComposition(composition) {
  if (typeof composition === 'string') {
    const _composition = _.get(this.compositions, composition);

    if (!_composition) {
      throw new ReferenceError(`Couldn't not ensure composition '${composition}', composition not defined.`);
    }

    return _composition;
  } else if (composition instanceof Composition) {
    return composition;
  } else if (typeof composition === 'object') {
    return _.find(this.compositions, _composition => {
        return _.eq(_composition.options, composition);
      }) || this.Composition(composition);
  } else {
    console.error('ensureComposition arguments', arguments);
    throw new TypeError(`Could not ensure composition, invalid composition provided.`);
  }
}

export default ViewDirector;