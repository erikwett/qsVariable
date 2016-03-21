# qsVariable
Variable extension for Qlik Sense

Allows the user to set the value of a variable.
Four different ways to render:
- Buttons: one button for each defined value
- Select: HTML select containing all defined values
- Field: an input field, no validation, anything can be entered
- Slider: a HTML slider, you can define min (default 0), max (default 100) and step (default 1)

The variable will be auto-created when you enter the name in the property panel.

Three different styles to choose from:
## Qlik
Styled like toolbar and property panel in Qlik Sense

![](qsVariable.png)
## Bootstrap
Styling inspired by Twitter Bootstrap

![](qsVariableB.png)

##Material
Styling inspired by Google Material design
![](qsVariableM.png)

##Installation
Download distribution zip file from here: https://github.com/erikwett/qsVariable/raw/master/dist/variable.zip

Qlik Sense Desktop: unzip to a directory under [My Documents]/Qlik/Sense/Extensions, for example variable.

Qlik Sense server: import the zip file in the QMC.