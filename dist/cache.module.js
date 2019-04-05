import { NgModule } from '@angular/core';
import { CacheService } from './cache.service';
import { IonicStorageModule } from '@ionic/storage';
var CacheModule = /** @class */ (function () {
    function CacheModule() {
    }
    CacheModule.forRoot = function () {
        return {
            ngModule: CacheModule,
            providers: [
                CacheService
            ]
        };
    };
    CacheModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        IonicStorageModule.forRoot({
                            name: '__ionicCache',
                            driverOrder: ['indexeddb', 'sqlite', 'websql']
                        })
                    ]
                },] },
    ];
    /** @nocollapse */
    CacheModule.ctorParameters = function () { return []; };
    return CacheModule;
}());
export { CacheModule };
//# sourceMappingURL=cache.module.js.map