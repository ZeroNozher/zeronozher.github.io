/**
 * Punto de entrada.
 *
 * Este archivo hace una sola cosa: decir qué herramientas existen.
 * Para sumar una, importala y agregala al arreglo.
 */

import { Tabs } from './ui/tabs.js';
import { elementaryOpsModule } from './modules/elementaryOps.js';
import { binaryOpsModule } from './modules/binaryOps.js';

const MODULOS = [elementaryOpsModule, binaryOpsModule];

const tabs = new Tabs(MODULOS);
tabs.mount(document.querySelector('#app'));
