# qsVariable
Variable extension for Qlik Sense

Allows the user to set the value of a variable.
Four different ways to render:
- Buttons: one button for each defined value
- Select: HTML select containing all defined values
- Field: an input field, no validation, anything can be entered
- Slider: a HTML slider, you can define min (default 0), max (default 100) and step (default 1)

## News in version 4.0
The extension no longer uses Mashup API/Capabilities API/qlik.js. Instead it uses Qlik enigma.js. This means that the old problem of getting hold of the app, which broke with Qlik Sense bug in Qlik Sense 3.2 SR3, is no longer needed, since enigmajs automatically gives you the right app.

Read more on this here: http://extendingqlik.upper88.com/using-enigmajs-in-your-qlik-sense-extension/

## News in version 3.1
You can now have an expression to define the available values in a dropdown or buttons. Thanks to Brett Farley of Context Bi for contributing to this feature. 

## News in Version 3
The extension is now upgraded for Qlik Sense June 2017. This version will probably not work for Qlik Sense 3.2 SR3 and SR4, so you will need to use the previous version, see below.

News in short:
- Auto-create of variable removed, create your variable in the script or in the variable dialog, both methods also allows you to set initial value
- Vertical sliders are now available
- workaround for Qlik Sense 3.2 SR3 and SR4 has been removed, so extension works in a multi-app mashup again

## Qlik Sense 3.2 SR3/SR4 Issue:
If you encounter problems with the extension in Qlik Sense 3.2 SR3 or SR4, this is probably because of a known bug with the Qlik Sense API. Please upgrade to Qlik Sense June 2017 or contact Qlik Support for a patch. If this is not possible, you can use the previous version of the extension. Download it from here:
https://github.com/erikwett/qsVariable/blob/Version2.3.1/dist/variable.zip

If you use the extension in a mashup with more than one app, this version might not work as expected.

Three different styles to choose from:
## Qlik
Styled like toolbar and property panel in Qlik Sense

![](qsVariable.png)
## Bootstrap
Styling inspired by Twitter Bootstrap

![](qsVariableB.png)

## Material
Styling inspired by Google Material design
![](qsVariableM.png)

## Vertical slider
You can now also have vertical orientation for your slider
![](vertSlider.png)

## Installation
Download distribution zip file from here: https://github.com/erikwett/qsVariable/raw/master/dist/variable.zip

Qlik Sense Desktop: unzip to a directory under [My Documents]/Qlik/Sense/Extensions, for example variable.

Qlik Sense server: import the zip file in the QMC.
