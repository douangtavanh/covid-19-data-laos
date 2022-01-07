# Covid-19 Data of Laos

## What data is collected in the data folder?
1. Vaccination data -The number of vaccinated people in total and by province. (update daily)
2. The number of Covid-19 cases. (Stopped update sinces May, 2020)
3. Population data in 4 categires: total population, 18yrs and older, 17yrs and older and 12yrs and older  - based on Lao Population Projections 2015 - 2045' - medium assumption projected mid year population in 2020.


All data related to Covid-19 cases and vaccination is collected from https://www.facebook.com/CCEH.MoH.Lao/

## NOTE:
* Regarding the flag column in "vaccination_data_laos_provincial.csv", 0 means there is no issues based on my data validation, while  1 means either the total number of first dose or the total number of second are different from the source.
* For "vaccination_covid_19_Laos.csv", it can be seen that the date is skipped. This is because the official government' Facebook page dose not report everyday. If you want to used this data, I create a file which includes all dates thus I suggest you to use "vaccination_covid_19_Laos_adjusted.csv" instead.


## Live demo
https://douangtavanh.com/projects/covid19-confirmed-cases-map/ & https://observablehq.com/@douangtavanh/visualization-covid-19-vaccination-data-laos



## Changelog

17 May 2021:
+ Removed data on 16 May 2021 as it is incorrect data. ref. (https://www.facebook.com/CIEH.MoH.Lao/photos/a.1580136645344357/4252839018074093/)

18 April 2020:
+ Updated all files.
+ Added new map function using Mapbox API but still using D3.js for drawing the map.
+ Added annotated text of cases in each province.
+ Added apporximate location of cases based on villages' information.


4 April 2020 NOTE:
-> index.html
+ Updated style file
+ Added font familiy: Awsome in order to add male and female icons on a tooltip.

-> Map folder
+ Added Lao province text in LAO_ADM1.json.
+ Rename mapTest to laoPDR.

+ Added functions for map
1. If there is a case, the text of the case will be changed.
2. Added information about sex of the case.
3. Adjusted tooltip's height.


"Code with ❤️ & ☕️"
