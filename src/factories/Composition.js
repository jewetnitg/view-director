import _ from 'lodash';
import FactoryFactory from 'frontend-factory';
import ObjectWithViewAndMiddleware from './ObjectWithViewAndMiddleware';
import StaticView from './StaticView';

/**
 * @todo document
 * @class Composition
 */
const Composition = ObjectWithViewAndMiddleware.extend({

  name: 'Composition',

  defaults(options = {}) {
    return {
      name: options.route
    };
  },

  prototype: {

    /**
     * @todo document
     * @todo implement
     * @param params
     * @param data
     * @param force
     * @returns {Promise}
     */
    render(params = {}, data = {}, force = false) {
      return Promise.all([
        ObjectWithViewAndMiddleware.prototype.render.call(this, params, data, force),
        runStaticViews('render', this.staticViews, [params, data, force])
      ]);
    },

    /**
     * @todo document
     * @param data
     * @param replace
     */
    sync(data, replace = false) {
      ObjectWithViewAndMiddleware.prototype.sync.call(this, data, replace);
      runStaticViews('sync', this.staticViews, [data, replace]);
    },

    /**
     * @todo document
     */
    hide() {
      ObjectWithViewAndMiddleware.prototype.hide.call(this);
      runStaticViews('hide', this.staticViews);
    },

    /**
     * @todo document
     */
    show() {
      ObjectWithViewAndMiddleware.prototype.show.call(this);
      runStaticViews('show', this.staticViews);
    }

  }

});

function runStaticViews(type, staticViews = [], args = []) {
  return _.map(staticViews, (name) => {
    const staticView = StaticView.staticViews[name];

    if (!staticView) {
      throw new ReferenceError(`StaticView with '${name}' doesn't exist.`);
    }

    return staticView[type].apply(staticView, args);
  });
}

/**
 * @todo document
 * @type {Object<Composition>}
 */
Composition.compositions = {};

export default Composition;