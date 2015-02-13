/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app =
{
    // Application Constructor
    initialize: function ()
    {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function ()
    {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        // Buttons

        var powerButton = document.getElementById('powerButton');
        powerButton.addEventListener('click', this.onPowerOnOff, false);

        var transitionStateButton = document.getElementById('transitionStateButton');
        transitionStateButton.addEventListener('click', this.onTransitionStateInvoke, false);

        var applyPulseEffectButton = document.getElementById('applyPulseEffectButton');
        applyPulseEffectButton.addEventListener('click', this.onApplyPulseEffectInvoke, false);

        // Slider bars

        var hueBar = document.getElementById('hueBar');
        hueBar.addEventListener('change', this.onHueChanged, false);

        var saturationBar = document.getElementById('saturationBar');
        saturationBar.addEventListener('change', this.onSaturationChanged, false);

        var colorTempBar = document.getElementById('colorTempBar');
        colorTempBar.addEventListener('change', this.onColorTempChanged, false);

        var brightnessBar = document.getElementById('brightnessBar');
        brightnessBar.addEventListener('change', this.onBrightnessChanged, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function ()
    {
        app.displayInfo('Connecting to bus...');

        if (AllJoyn)
        {
            AllJoyn.connect(app.onBusConnected, app.onError('AllJoyn.connect'));
        }
        else
        {
            console.log('Error: AllJoyn not found. (Is the plugin installed?)');
        }
    },

    onBusConnected: function (bus)
    {
        app.bus = bus;

        var proxyObjects =
        [
            {
                path: '/org/allseen/LSF/Lamp',
                interfaces:
                [
                    [
                        'org.freedesktop.DBus.Properties',
                        '?Get <s <s >v',
                        '?Set <s <s <v',
                        '?GetAll <s >a{sv}',
                        ''
                    ],

                    [
                        'org.allseen.LSF.LampService',
                        '?ClearLampFault LampFaultCode<u LampResponseCode>u LampFaultCode>u',
                        '@Version >u',
                        '@LampServiceVersion >u',
                        ''
                    ],

                    [
                        'org.allseen.LSF.LampParameters',
                        '@Version >u',
                        '@Energy_Usage_Milliwatts >u',
                        '@Brightness_Lumens >u',
                        ''
                    ],

                    [
                        'org.allseen.LSF.LampDetails',
                        '@Version >u',
                        '@Make >u',
                        '@Model >u',
                        '@Type >u',
                        '@LampType >u',
                        '@LampBaseType >u',
                        '@LampBeamAngle >u',
                        '@Dimmable >b',
                        '@Color >b',
                        '@VariableColorTemp >b',
                        '@HasEffects >b',
                        '@MinVoltage >u',
                        '@MaxVoltage >u',
                        '@Wattage >u',
                        '@IncandescentEquivalent >u',
                        '@MaxLumens >u',
                        '@MinTemperature >u',
                        '@MaxTemperature >u',
                        '@ColorRenderingIndex >u',
                        '@LampID >s',
                        ''
                    ],

                    [
                        'org.allseen.LSF.LampState',
                        '?TransitionLampState Timestamp<t NewState<a{sv} TransitionPeriod<u LampResponseCode>u',
                        '?ApplyPulseEffect FromState<a{sv} ToState<a{sv} period<u duration<u numPulses<u timestamp<t LampResponseCode>u',
                        '!LampStateChanged LampID>s',
                        '@Version >u',
                        '@OnOff =b',
                        '@Hue =u',
                        '@Saturation =u',
                        '@ColorTemp =u',
                        '@Brightness =u',
                        ''
                    ],

                    null
                ]
            },

            null
        ];

        AllJoyn.registerObjects(app.onRegiteredObjects, app.onError('AllJoyn.RegisterObject'), null, proxyObjects);
    },

    onRegiteredObjects: function ()
    {
        app.displayInfo('Looking for lightbulb...');
        app.bus.addInterfacesListener(['org.allseen.LSF.LampState'], app.onFoundLightbulb);
    },

    onFoundLightbulb: function (lightbulbInfo)
    {
        app.lightbulbInfo = lightbulbInfo;

        var service =
        {
            name: lightbulbInfo.name,
            port: lightbulbInfo.port
        };

        app.bus.joinSession(app.onJoinedLightbulbSession, app.onError('bus.joinSession'), service);
    },

    onJoinedLightbulbSession: function (lightbulbSession)
    {
        app.lightbulbSession = lightbulbSession;
        app.displayInfo('Connected');
        lsfLampState.initialize();
    },

    onPowerOnOff: function ()
    {
        if (app.lightbulbSession && !lsfLampState.busy)
        {
            if (lsfLampState.onOff)
            {
                lsfLampState.hue = 0;
                document.getElementById("hueBar").value = 0;
                lsfLampState.saturation = 0;
                document.getElementById("saturationBar").value = 0;
                lsfLampState.colorTemp = 0;
                document.getElementById("colorTempBar").value = 0;
                lsfLampState.brightness = 0;
                document.getElementById("brightnessBar").value = 0;
                lsfLampState.powerOff();
            }
            else
            {
                lsfLampState.powerOn();
            }
        }
    },

    onHueChanged: function ()
    {
        if (app.lightbulbSession && !lsfLampState.busy)
        {
            lsfLampState.setHue(this.value);
        }
    },

    onSaturationChanged: function ()
    {
        if (app.lightbulbSession && !lsfLampState.busy)
        {
            lsfLampState.setSaturation(this.value);
        }
    },

    onColorTempChanged: function ()
    {
        if (app.lightbulbSession && !lsfLampState.busy)
        {
            lsfLampState.setColorTemp(this.value);
        }
    },

    onBrightnessChanged: function ()
    {
        if (app.lightbulbSession && !lsfLampState.busy)
        {
            lsfLampState.setBrightness(this.value);
        }
    },

    onSuccess: function ()
    {
        return function ()
        {
        };
    },

    onError: function (failureType)
    {
        return function (error)
        {
            if (error)
            {
                console.log('Error: ' + failureType);
            }
        };
    },

    displayInfo: function (info)
    {
        console.log(info);
        document.getElementById("info").textContent = info;
    },
};

app.initialize();

var lsfLampState =
{
    onOff: false,
    hue: 0,
    saturation: 0,
    colorTemp: 0,
    brightness: 0,
    busy: false,

    initialize: function()
    {
        var initializeMsg = [2, 0, 0, 2]; // Proxy object list, object index, interface index, method index

        var args =
        [
            'org.allseen.LSF.LampState'
        ];

        var onInitialized = function (returnArgs)
        {
            lsfLampState.onOff = returnArgs[2];
            lsfLampState.hue = returnArgs[5];
            document.getElementById("hueBar").value = lsfLampState.setPercentageRange(lsfLampState.hue);
            lsfLampState.saturation = returnArgs[8];
            document.getElementById("saturationBar").value = lsfLampState.setPercentageRange(lsfLampState.saturation);
            lsfLampState.colorTemp = returnArgs[11];
            document.getElementById("colorTempBar").value = lsfLampState.setPercentageRange(lsfLampState.colorTemp);
            lsfLampState.brightness = returnArgs[14];
            document.getElementById("brightnessBar").value = lsfLampState.setPercentageRange(lsfLampState.brightness);
        }

        app.lightbulbSession.callMethod(onInitialized, app.onError('Initialize'), null, null, initializeMsg, 's', args, 'a{sv}');
    },

    transitionState: function (bOnOff, uHue, uSaturation, uColorTemp, uBrightness, uTransitionPeriod)
    {
        var transitionLampStateMsg = [2, 0, 4, 0]; // Proxy object list, object index, interface index, method index

        var args =
        [
            0,
            [
                ['OnOff', 'b', bOnOff],
                ['Hue', 'u', uHue],
                ['Saturation', 'u', uSaturation],
                ['ColorTemp', 'u', uColorTemp],
                ['Brightness', 'u', uBrightness]
            ],
            uTransitionPeriod
        ];

        var onLampStateChanged = function (returnArgs)
        {
            var uResponse = returnArgs[0];

            if (uResponse == 0) // successful
            {
                lsfLampState.onOff = bOnOff;
                lsfLampState.hue = uHue;
                lsfLampState.saturation = uSaturation;
                lsfLampState.colorTemp = uColorTemp;
                lsfLampState.brightness = uBrightness;
                lsfLampState.busy = false;
            }
        }

        lsfLampState.busy = true;
        app.lightbulbSession.callMethod(onLampStateChanged, app.onError('TransitionLampState'), null, null, transitionLampStateMsg, 'ta{sv}u', args, 'u');
    },

    powerOn: function ()
    {
        lsfLampState.transitionState(true, lsfLampState.hue, lsfLampState.saturation, lsfLampState.colorTemp, lsfLampState.brightness, 0);
    },

    powerOff: function ()
    {
        lsfLampState.transitionState(false, lsfLampState.hue, lsfLampState.saturation, lsfLampState.colorTemp, lsfLampState.brightness, 0);
    },

    setHue: function (hue)
    {
        var uHue = this.setOEMRange(hue);
        lsfLampState.transitionState(true, uHue, lsfLampState.saturation, lsfLampState.colorTemp, lsfLampState.brightness, 0);
    },

    setSaturation: function (saturation)
    {
        var uSaturation = this.setOEMRange(saturation);
        lsfLampState.transitionState(true, lsfLampState.hue, uSaturation, lsfLampState.colorTemp, lsfLampState.brightness, 0);
    },

    setColorTemp: function (colorTemp)
    {
        var uColorTemp = this.setOEMRange(colorTemp);
        lsfLampState.transitionState(true, lsfLampState.hue, lsfLampState.saturation, uColorTemp, lsfLampState.brightness, 0);
    },

    setBrightness: function (brightness)
    {
        var uBrightness = this.setOEMRange(brightness);
        lsfLampState.transitionState(true, lsfLampState.hue, lsfLampState.saturation, lsfLampState.colorTemp, uBrightness, 0);
    },

    setOEMRange: function (value)
    {
        return value * ((0xFFFFFFFF - 1) / 100);
    },

    setPercentageRange: function (value)
    {
        return value / ((0xFFFFFFFF - 1) / 100);
    }
};