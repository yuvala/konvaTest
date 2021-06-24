/// <reference path="../Scripts/typings/angularjs/angular.d.ts" /> 
declare var moment: any;

interface ILogger {
    getInstance(instanceName: string): ILog;
}
interface ILog {
    debug(message:string): void;
    log(message: string): void;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}

(function () {
    'use strict';
   
    var logger = angular.module('quentry.logger', []);
    //////////////////////////////////////////////////////////////////
    /// Enhanced Logger
    ///
    /// Usage:
    /// var logger = $log.getInstance('MyController');
    /// logger.info('testing 1 2 3');
    /// output: Thursday 11:02:00 am::[MyController]> testing 1 2 3
    /////////////////////////////////////////////////////////////////
    ///TODO: inject momentjs
    logger.provider('logger', function () {
        var _sendToServer = false;
        this.setSendErrorsToServer = function (doSend) {
            _sendToServer = doSend;
        };

        var _muteLogging = false;
        this.setMuteLogging = function (isMuted) {
            _muteLogging = isMuted;
        };

        this.$get = function () {
            /// builds the prefix of the message and calls the logging function
            /// TODO: refactor sendMessageToServer 
            var _this = this;
            _this.enhancedLogging = function (loggingFunc, context, sendMessageToServer) {
                return function () {
                    var modifiedArguments = [].slice.call(arguments);
                    modifiedArguments[0] = ['TraumaCad::' + moment().format("dddd h:mm:ss a") + '::[' + context + ']> '] + modifiedArguments[0];
                    _muteLogging || loggingFunc.apply(null, modifiedArguments);

                    sendMessageToServer && _sendToServer && _this.sendErrorsToServer(modifiedArguments);
                };
            }

            _this.sendErrorsToServer = function(args) {
                console.log('sending to server:', args);
                /// TODO: send error to server
            }

            return function ($delegate, context) {
                var loggerInstance: ILog =  {
                    debug: _this.enhancedLogging($delegate.debug, context),
                    log: _this.enhancedLogging($delegate.log, context),
                    info: _this.enhancedLogging($delegate.info, context),
                    error: _this.enhancedLogging($delegate.error, context, true),
                    warn: _this.enhancedLogging($delegate.warn, context, true)
                };
                return loggerInstance;
            };
        };
    });

    /// $log decorator to use the Logger factory
    logger.config(function ($provide) {
        $provide.decorator("$log", ['$delegate', 'logger', function ($delegate, logger) {
            return {
                getInstance: function (context) {
                    return logger($delegate, context);
                }
            };
        }]);
    });

    ////////////////////
    /// Error Handler
    ///////////////////

    /// Decorator pattern
    /// Not in use since we want to override the default action
    //logger.config(function ($provide) {
    //    $provide.decorator("$exceptionHandler", function ($delegate) {
    //        return function (exception, cause) {
    //            $delegate(exception, cause);
    //            alert(exception.message);
    //        };
    //    });
    //});

    /// overrides the default exceptionHandler
    /// TODO: maybe implement a decorator
    logger.factory('$exceptionHandler', ['$log', function ($log) {
        var logger = $log.getInstance('Exception');
        return function (exception, cause) {
            exception += '(caused by "' + cause + '")';
            logger.error(exception);
        };
    }]);

    logger.factory('ErrorLogger', ['SignalR', '$log', function (SignalR, $log) {
        var logger = $log.getInstance('ErrorLogger');

        var hub = SignalR.getHub('errorLoggerHub');
        SignalR.openConnection(function () {
            logger.debug('Connected to error logger hub');
        });

        return {
            logError: function (exception) {
                logger.debug('Sending error to server:', exception);
                hub.server.logError(exception);
            }
        };
    }]);

}());