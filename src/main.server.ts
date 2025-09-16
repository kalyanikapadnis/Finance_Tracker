import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { ApplicationRef } from '@angular/core';
import { appConfig } from './app/app.config';

const bootstrap = (context: BootstrapContext) : Promise<ApplicationRef> => 
    bootstrapApplication(App, {
        providers:[...(appConfig.providers || [])]
    }, context);

export default bootstrap;
