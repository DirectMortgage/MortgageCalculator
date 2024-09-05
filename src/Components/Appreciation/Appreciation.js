import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faLocationDot,
  faMagnifyingGlass,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  AutoCompleteInputBox,
  Dropdown,
  InputBox,
  useScrollIndicator,
} from "../../CommonFunctions/Accessories";
import RangeSlider from "react-range-slider-input";
import {
  formatCurrency,
  formatPercentage,
  queryStringToObject,
} from "../../CommonFunctions/GeneralCalculations";
import Plot from "react-plotly.js";
import {
  handleAPI,
  handleGetDownPaymentDetails,
  handleGetLoanData,
} from "../../CommonFunctions/CommonFunctions";

const { w, f, loanId, p } = queryStringToObject(window.location?.href || ""),
  isMobile = f === "m",
  isApp = Boolean(parseInt(p)),
  medianHomePriceObj = {
    "United States": 405933,
    "New York, NY": 716000,
    "Los Angeles, CA": 1095333,
    "Chicago, IL": 358267,
    "Dallas, TX": 438300,
    "Houston, TX": 365963,
    "Washington, DC": 591000,
    "Philadelphia, PA": 359633,
    "Miami, FL": 518333,
    "Atlanta, GA": 397663,
    "Boston, MA": 782333,
    "Phoenix, AZ": 508333,
    "San Francisco, CA": 1009667,
    "Riverside, CA": 599000,
    "Detroit, MI": 250713,
    "Seattle, WA": 749667,
    "Minneapolis, MN": 389967,
    "San Diego, CA": 973300,
    "Tampa, FL": 413333,
    "Denver, CO": 616666,
    "Baltimore, MD": 366633,
    "St. Louis, MO": 239133,
    "Orlando, FL": 430997,
    "Charlotte, NC": 416667,
    "San Antonio, TX": 339926,
    "Portland, OR": 579937,
    "Sacramento, CA": 636300,
    "Pittsburgh, PA": 239633,
    "Cincinnati, OH": 305000,
    "Austin, TX": 528017,
    "Las Vegas, NV": 463333,
    "Kansas City, MO": 324817,
    "Columbus, OH": 351600,
    "Indianapolis, IN": 312383,
    "Cleveland, OH": 242300,
    "San Jose, CA": 1449000,
    "Nashville, TN": 531633,
    "Virginia Beach, VA": 350000,
    "Providence, RI": 511333,
    "Jacksonville, FL": 399633,
    "Milwaukee, WI": 339983,
    "Oklahoma City, OK": 310333,
    "Raleigh, NC": 469083,
    "Memphis, TN": 299383,
    "Richmond, VA": 395117,
    "Louisville, KY": 298267,
    "New Orleans, LA": 321333,
    "Salt Lake City, UT": 582583,
    "Hartford, CT": 373300,
    "Buffalo, NY": 252933,
    "Birmingham, AL": 298667,
    "Rochester, NY": 223300,
    "Grand Rapids, MI": 358683,
    "Tucson, AZ": 387967,
    "Urban Honolulu, HI": 711333,
    "Tulsa, OK": 303600,
    "Fresno, CA": 442750,
    "Worcester, MA": 474933,
    "Omaha, NE": 325000,
    "Bridgeport, CT": 766300,
    "Greenville, SC": 346667,
    "Albuquerque, NM": 390000,
    "Bakersfield, CA": 386333,
    "Albany, NY": 337383,
    "Knoxville, TN": 429967,
    "Baton Rouge, LA": 287933,
    "McAllen, TX": 249167,
    "New Haven, CT": 373333,
    "El Paso, TX": 294150,
    "Allentown, PA": 349667,
    "Oxnard, CA": 982333,
    "Columbia, SC": 299900,
    "North Port, FL": 505500,
    "Dayton, OH": 241267,
    "Charleston, SC": 523325,
    "Greensboro, NC": 298117,
    "Stockton, CA": 569975,
    "Cape Coral, FL": 355157,
    "Boise City, ID": 552867,
    "Colorado Springs, CO": 488333,
    "Little Rock, AR": 268833,
    "Lakeland, FL": 348000,
    "Akron, OH": 231967,
    "Des Moines, IA": 318333,
    "Springfield, MA": 349967,
    "Poughkeepsie, NY": 499300,
    "Ogden, UT": 524650,
    "Madison, WI": 439967,
    "Winston, NC": 308917,
    "Deltona, FL": 389965,
    "Syracuse, NY": 248267,
    "Provo, UT": 565617,
    "Toledo, OH": 218083,
    "Wichita, KS": 273667,
    "Durham, NC": 460000,
    "Augusta, GA": 288167,
    "Palm Bay, FL": 383333,
    "Jackson, MS": 266333,
    "Harrisburg, PA": 285467,
    "Spokane, WA": 475000,
    "Scranton, PA": 237817,
    "Chattanooga, TN": 390127,
    "Modesto, CA": 507163,
    "Lancaster, PA": 341633,
    "Portland, ME": 596050,
    "Youngstown, OH": 176500,
    "Lansing, MI": 229633,
    "Fayetteville, AR": 426667,
    "Fayetteville, NC": 273233,
    "Lexington, KY": 365000,
    "Pensacola, FL": 364933,
    "Santa Rosa, CA": 907667,
    "Reno, NV": 647967,
    "Huntsville, AL": 366567,
    "Port St. Lucie, FL": 437761,
    "Lafayette, LA": 243667,
    "Myrtle Beach, SC": 333298,
    "Springfield, MO": 301633,
    "Visalia, CA": 399600,
    "Killeen, TX": 299875,
    "Asheville, NC": 503000,
    "York, PA": 294250,
    "Vallejo, CA": 595667,
    "Santa Maria, CA": 1466167,
    "Salinas, CA": 1153333,
    "Salem, OR": 491333,
    "Mobile, AL": 246090,
    "Reading, PA": 298950,
    "Corpus Christi, TX": 328000,
    "Brownsville, TX": 308133,
    "Manchester, NH": 497917,
    "Fort Wayne, IN": 269467,
    "Gulfport, MS": 242000,
    "Salisbury, MD": 464967,
    "Flint, MI": 186600,
    "Peoria, IL": 169283,
    "Canton, OH": 229583,
    "Savannah, GA": 400000,
    "Anchorage, AK": 431300,
    "Beaumont, TX": 227917,
    "Shreveport, LA": 223767,
    "Trenton, NJ": 444150,
    "Montgomery, AL": 249600,
    "Davenport, IA": 194248,
    "Tallahassee, FL": 306333,
    "Eugene, OR": 495717,
    "Naples, FL": 719600,
    "Ann Arbor, MI": 446617,
    "Ocala, FL": 314967,
    "Hickory, NC": 295717,
    "Huntington, WV": 191467,
    "Fort Collins, CO": 624983,
    "Rockford, IL": 201470,
    "Lincoln, NE": 308967,
    "Gainesville, FL": 344633,
    "Boulder, CO": 862667,
    "Green Bay, WI": 372383,
    "Columbus, GA": 221133,
    "South Bend, IN": 246600,
    "Spartanburg, SC": 299796,
    "Greeley, CO": 523300,
    "Lubbock, TX": 248000,
    "Clarksville, TN": 319500,
    "Roanoke, VA": 341617,
    "Evansville, IN": 233083,
    "Kingsport, TN": 295950,
    "Kennewick, WA": 493217,
    "Utica, NY": 227000,
    "Hagerstown, MD": 329667,
    "Duluth, MN": 309950,
    "Olympia, WA": 556500,
    "Longview, TX": 298508,
    "Wilmington, NC": 516333,
    "San Luis Obispo, CA": 1068333,
    "Crestview, FL": 616667,
    "Merced, CA": 447433,
    "Waco, TX": 301667,
    "Cedar Rapids, IA": 234633,
    "Atlantic City, NJ": 371633,
    "Bremerton, WA": 621633,
    "Sioux Falls, SD": 359933,
    "Santa Cruz, CA": 1270667,
    "Erie, PA": 207317,
    "Norwich, CT": 394633,
    "Amarillo, TX": 278283,
    "Laredo, TX": 246533,
    "Tuscaloosa, AL": 286517,
    "College Station, TX": 351273,
    "Kalamazoo, MI": 299633,
    "Lynchburg, VA": 323300,
    "Charleston, WV": 168000,
    "Yakima, WA": 408633,
    "Fargo, ND": 350213,
    "Binghamton, NY": 197233,
    "Fort Smith, AR": 256783,
    "Appleton, WI": 358967,
    "Prescott Valley, AZ": 549783,
    "Topeka, KS": 241000,
    "Macon, GA": 150750,
    "Tyler, TX": 374206,
    "Barnstable Town, MA": 849533,
    "Daphne, AL": 492130,
    "Bellingham, WA": 677667,
    "Burlington, VT": 504483,
    "Rochester, MN": 342800,
    "Lafayette, IN": 315667,
    "Champaign, IL": 251617,
    "Medford, OR": 526667,
    "Lebanon, NH": 488000,
    "Charlottesville, VA": 523150,
    "Lake Charles, LA": 229867,
    "Las Cruces, NM": 349823,
    "Chico, CA": 437667,
    "Hilton Head Island, SC": 597667,
    "Athens, GA": 408000,
    "Lake Havasu City, AZ": 354167,
    "Columbia, MO": 370833,
    "Springfield, IL": 186300,
    "Houma, LA": 227483,
    "Monroe, LA": 243667,
    "Elkhart, IN": 278300,
    "Johnson City, TN": 343300,
    "Yuma, AZ": 332333,
    "Gainesville, GA": 477833,
    "Jacksonville, NC": 311283,
    "Florence, SC": 235567,
    "Hilo, HI": 628000,
    "St. Cloud, MN": 333333,
    "Racine, WI": 299616,
    "Bend, OR": 788650,
    "Saginaw, MI": 181933,
    "Warner Robins, GA": 266300,
    "Terre Haute, IN": 178267,
    "Torrington, CT": 492148,
    "Punta Gorda, FL": 349867,
    "Billings, MT": 434967,
    "Redding, CA": 424467,
    "Kingston, NY": 529667,
    "Panama City, FL": 408800,
    "Joplin, MO": 233267,
    "Dover, DE": 379967,
    "El Centro, CA": 341150,
    "Jackson, TN": 286433,
    "Yuba City, CA": 465000,
    "Bowling Green, KY": 324900,
    "St. George, UT": 621667,
    "Muskegon, MI": 249667,
    "Abilene, TX": 254800,
    "Iowa City, IA": 329600,
    "Auburn, AL": 387516,
    "Midland, TX": 400800,
    "Bloomington, IL": 255783,
    "Hattiesburg, MS": 269658,
    "Oshkosh, WI": 290633,
    "Eau Claire, WI": 314150,
    "Greenville, NC": 278283,
    "Burlington, NC": 329111,
    "Waterloo, IA": 242633,
    "Coeur d'Alene, ID": 664150,
    "East Stroudsburg, PA": 344500,
    "Pueblo, CO": 356667,
    "Blacksburg, VA": 323167,
    "Wausau, WI": 280500,
    "Kahului, HI": 1245000,
    "Janesville, WI": 271600,
    "Tupelo, MS": 248000,
    "Bloomington, IN": 351333,
    "Odessa, TX": 273000,
    "Jackson, MI": 248250,
    "State College, PA": 365000,
    "Sebastian, FL": 421667,
    "Madera, CA": 500750,
    "Decatur, AL": 292967,
    "Chambersburg, PA": 289600,
    "Vineland, NJ": 264950,
    "Idaho Falls, ID": 454500,
    "Grand Junction, CO": 455333,
    "Elizabethtown, KY": 301617,
    "Niles, MI": 348200,
    "Monroe, MI": 261600,
    "Santa Fe, NM": 699317,
    "Concord, NH": 493300,
    "Alexandria, LA": 222250,
    "Traverse City, MI": 455967,
    "Bangor, ME": 285967,
    "Homosassa Springs, FL": 319150,
    "Hanford, CA": 369600,
    "Jefferson City, MO": 295933,
    "Florence, AL": 277400,
    "Dothan, AL": 229983,
    "London, KY": 228233,
    "Albany, GA": 174100,
    "Ottawa, IL": 189950,
    "Sioux City, IA": 254983,
    "Wichita Falls, TX": 215633,
    "Texarkana, TX": 239317,
    "Valdosta, GA": 272233,
    "Logan, UT": 466633,
    "Flagstaff, AZ": 685483,
    "Rocky Mount, NC": 224950,
    "Pottsville, PA": 149467,
    "Dalton, GA": 315667,
    "Lebanon, PA": 292650,
    "Morristown, TN": 418333,
    "Winchester, VA": 419983,
    "Wheeling, WV": 164317,
    "Morgantown, WV": 330817,
    "La Crosse, WI": 323017,
    "Napa, CA": 1355500,
    "Rapid City, SD": 420483,
    "Sumter, SC": 255100,
    "Eureka, CA": 490167,
    "Springfield, OH": 203267,
    "Harrisonburg, VA": 388800,
    "Battle Creek, MI": 214300,
    "Sherman, TX": 374467,
    "Manhattan, KS": 266833,
    "Carbondale, IL": 145000,
    "Johnstown, PA": 129833,
    "Jonesboro, AR": 231600,
    "Bismarck, ND": 410833,
    "Hammond, LA": 255833,
    "Pittsfield, MA": 475000,
    "Mount Vernon, WA": 656333,
    "Jamestown, NY": 215417,
    "The Villages, FL": 401567,
    "Albany, OR": 445667,
    "Glens Falls, NY": 309633,
    "Lawton, OK": 173167,
    "Cleveland, TN": 353300,
    "Sierra Vista, AZ": 302883,
    "Ames, IA": 278567,
    "Mansfield, OH": 219900,
    "Staunton, VA": 349917,
    "Augusta, ME": 371300,
    "Altoona, PA": 157783,
    "New Bern, NC": 324800,
    "Farmington, NM": 351483,
    "St. Joseph, MO": 187083,
    "San Angelo, TX": 279783,
    "Wenatchee, WA": 697667,
    "Owensboro, KY": 240250,
    "Holland, MI": 404733,
    "Lumberton, NC": 204983,
    "Lawrence, KS": 345967,
    "Goldsboro, NC": 274933,
    "Watertown, NY": 249933,
    "Sheboygan, WI": 313733,
    "Weirton, WV": 158617,
    "Missoula, MT": 632583,
    "Wooster, OH": 260650,
    "Bozeman, MT": 826583,
    "Anniston, AL": 206467,
    "Beckley, WV": 182733,
    "Williamsport, PA": 236750,
    "Brunswick, GA": 423333,
    "California, MD": 447050,
    "Twin Falls, ID": 414633,
    "Cookeville, TN": 351593,
    "Muncie, IN": 167450,
    "Michigan City, IN": 286417,
    "Roseburg, OR": 390317,
    "Lewiston, ME": 344633,
    "Longview, WA": 434966,
    "Ogdensburg, NY": 171333,
    "Kankakee, IL": 213583,
    "Bluefield, WV": 183266,
    "Show Low, AZ": 479900,
    "Richmond, KY": 298117,
    "Tullahoma, TN": 419967,
    "Whitewater, WI": 437967,
    "Ithaca, NY": 396483,
    "Grand Forks, ND": 299450,
    "Decatur, IL": 142500,
    "LaGrange, GA": 229150,
    "Bay City, MI": 175300,
    "Fond du Lac, WI": 280467,
    "Gettysburg, PA": 366667,
    "Gadsden, AL": 238283,
    "Kalispell, MT": 749667,
    "Danville, VA": 190800,
    "Mankato, MN": 349467,
    "Lima, OH": 200617,
    "Salem, OH": 159633,
    "Truckee, CA": 699950,
    "Sebring, FL": 236298,
    "Cheyenne, WY": 409633,
    "Hot Springs, AR": 333060,
    "Adrian, MI": 256633,
    "Shelby, NC": 268633,
    "Dubuque, IA": 261967,
    "Meridian, MS": 204117,
    "Pinehurst, NC": 487667,
    "Paducah, KY": 241600,
    "Victoria, TX": 256117,
    "Rome, GA": 258483,
    "Sevierville, TN": 652965,
    "Moses Lake, WA": 424533,
    "Ashtabula, OH": 200917,
    "Cape Girardeau, MO": 195083,
    "Albertville, AL": 320617,
    "Fairbanks, AK": 334133,
    "Brainerd, MN": 398267,
    "Cumberland, MD": 178933,
    "Ocean City, NJ": 727417,
    "Corvallis, OR": 575667,
    "Pocatello, ID": 396300,
    "Corning, NY": 225483,
    "New Philadelphia, OH": 222300,
    "Sunbury, PA": 162417,
    "Ukiah, CA": 652333,
    "Hermiston, OR": 348633,
    "Clarksburg, WV": 196783,
    "Parkersburg, WV": 199900,
    "Beaver Dam, WI": 321483,
    "Pine Bluff, AR": 141250,
    "Grants Pass, OR": 475000,
    "Cullman, AL": 299933,
    "Lufkin, TX": 284667,
    "Zanesville, OH": 252933,
    "New Castle, PA": 138550,
    "Oak Harbor, WA": 747417,
    "Orangeburg, SC": 239533,
    "Watertown, WI": 363100,
    "Meadville, PA": 197583,
    "Elmira, NY": 187417,
    "Great Falls, MT": 340133,
    "Laurel, MS": 210917,
    "Russellville, AR": 239950,
    "Indiana, PA": 165750,
    "Midland, MI": 264817,
    "Kokomo, IN": 199817,
    "Bloomsburg, PA": 248417,
    "Opelousas, LA": 178833,
    "Helena, MT": 536283,
    "Key West, FL": 1197500,
    "Talladega, AL": 233933,
    "Stillwater, OK": 265815,
    "Columbus, IN": 297933,
    "Athens, TX": 376133,
    "Centralia, WA": 482417,
    "Manitowoc, WI": 241500,
    "Hinesville, GA": 275883,
    "DuBois, PA": 165783,
    "Warsaw, IN": 311583,
    "Plattsburgh, NY": 247300,
    "Statesboro, GA": 352007,
    "Casper, WY": 332500,
    "Wilson, NC": 252483,
    "Glenwood Springs, CO": 1480833,
    "Seneca, SC": 355833,
    "Minot, ND": 284950,
    "Olean, NY": 180633,
    "Chillicothe, OH": 256333,
    "Searcy, AR": 231150,
    "Grand Island, NE": 288333,
    "Port Angeles, WA": 617000,
    "Auburn, NY": 263000,
    "Huntsville, TX": 307667,
    "Keene, NH": 399000,
    "Heber, UT": 1215000,
    "Quincy, IL": 177133,
    "Sandusky, OH": 307967,
    "Findlay, OH": 254333,
    "Frankfort, KY": 294900,
    "Danville, IL": 129650,
    "Aberdeen, WA": 396246,
    "Portsmouth, OH": 176633,
    "Somerset, PA": 231133,
    "Wisconsin Rapids, WI": 238867,
    "Jefferson, GA": 448483,
    "Kapaa, HI": 1297333,
    "Palatka, FL": 281317,
    "Gallup, NM": 236833,
    "Hobbs, NM": 218150,
    "Shawnee, OK": 233300,
    "Fort Payne, AL": 297233,
    "Mount Airy, NC": 293233,
    "Stevens Point, WI": 292450,
    "Greeneville, TN": 304383,
    "Greenwood, SC": 276967,
    "Lake City, FL": 329617,
    "Klamath Falls, OR": 356917,
    "Morehead City, NC": 588600,
    "Clearlake, CA": 399400,
    "Alamogordo, NM": 288750,
    "Roanoke Rapids, NC": 162883,
    "Farmington, MO": 206450,
    "Muskogee, OK": 179817,
    "Marion, IN": 144517,
    "Faribault, MN": 395300,
    "Richmond, IN": 187567,
    "Marquette, MI": 276417,
    "North Wilkesboro, NC": 320050,
    "Mount Pleasant, MI": 222317,
    "Rio Grande City, TX": 189167,
    "Marion, OH": 204098,
    "Baraboo, WI": 353267,
    "Red Bluff, CA": 417500,
    "Marinette, WI": 248883,
    "Jasper, AL": 249900,
    "Roswell, NM": 249667,
    "Shelton, WA": 523967,
    "Dublin, GA": 221608,
    "Nacogdoches, TX": 272421,
    "Somerset, KY": 289633,
    "Coos Bay, OR": 385500,
    "Forest City, NC": 334948,
    "Martinsville, VA": 186400,
    "Rexburg, ID": 508250,
    "Lewiston, ID": 426500,
    "Laconia, NH": 556417,
    "Georgetown, SC": 425817,
    "Athens, OH": 245333,
    "Sanford, NC": 348132,
    "Enid, OK": 195083,
    "Mount Vernon, OH": 331017,
    "Walla Walla, WA": 476333,
    "Albemarle, NC": 305083,
    "Hutchinson, KS": 157149,
    "Hudson, NY": 606333,
    "Starkville, MS": 353267,
    "Carlsbad, NM": 280500,
    "Gillette, WY": 364167,
    "Sturgis, MI": 262433,
    "Rutland, VT": 376667,
    "Crossville, TN": 369650,
    "Granbury, TX": 448967,
    "Sayre, PA": 216780,
    "Salina, KS": 190833,
    "Marietta, OH": 248216,
    "Fergus Falls, MN": 381617,
    "Barre, VT": 435083,
    "Fremont, OH": 175600,
    "Oneonta, NY": 251167,
    "Columbus, MS": 240408,
    "Norwalk, OH": 210817,
    "Batavia, NY": 222267,
    "Ardmore, OK": 204967,
    "Palestine, TX": 265967,
    "Fort Madison, IA": 132433,
    "Charleston, IL": 136633,
    "Fernley, NV": 424650,
    "Carson City, NV": 549800,
    "Eagle Pass, TX": 263333,
    "Calhoun, GA": 322967,
    "Cullowhee, NC": 549667,
    "Kearney, NE": 303383,
    "Fairmont, WV": 193717,
    "Ontario, OR": 408617,
    "Gaffney, SC": 235817,
    "Picayune, MS": 269283,
    "Sterling, IL": 143250,
    "Branson, MO": 258333,
    "Cedar City, UT": 433117,
    "Waycross, GA": 204450,
    "Oxford, MS": 476133,
    "Jasper, IN": 253917,
    "Edwards, CO": 1865833,
    "Durango, CO": 785000,
    "Kinston, NC": 204567,
    "Sonora, CA": 452333,
    "Tiffin, OH": 183917,
    "Batesville, AR": 199233,
    "Point Pleasant, WV": 226300,
    "Elko, NV": 396333,
    "Danville, KY": 270867,
    "Glasgow, KY": 263000,
    "St. Marys, GA": 336617,
    "Boone, NC": 492933,
    "Warrensburg, MO": 316967,
    "Gloversville, NY": 211417,
    "Fort Leonard Wood, MO": 239650,
    "Poplar Bluff, MO": 177000,
    "Elizabeth City, NC": 337167,
    "Payson, AZ": 509150,
    "Athens, TN": 292967,
    "Enterprise, AL": 246333,
    "Ashland, OH": 242383,
    "Scottsboro, AL": 286283,
    "Milledgeville, GA": 298617,
    "Kerrville, TX": 551467,
    "Bartlesville, OK": 213300,
    "Platteville, WI": 243249,
    "Corsicana, TX": 282283,
    "Greenville, OH": 216933,
    "Rochelle, IL": 207967,
    "Alexander City, AL": 442650,
    "Douglas, GA": 260717,
    "Oil City, PA": 172967,
    "Mason City, IA": 226133,
    "Jacksonville, TX": 302300,
    "Galesburg, IL": 131600,
    "Pahrump, NV": 398912,
    "Paris, TX": 280250,
    "Winona, MN": 316267,
    "Newport, OR": 574650,
    "Morgan City, LA": 200533,
    "Shelbyville, TN": 427983,
    "Amsterdam, NY": 204650,
    "Ozark, AL": 165150,
    "Alice, TX": 207583,
    "Gardnerville Ranchos, NV": 865000,
    "Fort Polk South, LA": 191650,
    "Ca-¦on City, CO": 393583,
    "Natchez, MS": 281000,
    "New Castle, IN": 204650,
    "Clovis, NM": 234667,
    "Norfolk, NE": 262917,
    "Cadillac, MI": 274083,
    "Ruston, LA": 250000,
    "Sidney, OH": 238833,
    "Pullman, WA": 442133,
    "Malone, NY": 229742,
    "Del Rio, TX": 269150,
    "Blackfoot, ID": 411667,
    "Red Wing, MN": 339000,
    "Nogales, AZ": 393667,
    "Tahlequah, OK": 227150,
    "Kendallville, IN": 241250,
    "Montrose, CO": 658983,
    "Cortland, NY": 205467,
    "Mount Sterling, KY": 236033,
    "Clinton, IA": 183450,
    "Sandpoint, ID": 725000,
    "Bardstown, KY": 289950,
    "Wapakoneta, OH": 232817,
    "Plymouth, IN": 286767,
    "Lewistown, PA": 182450,
    "Bemidji, MN": 318217,
    "Bellefontaine, OH": 253083,
    "Seymour, IN": 240433,
    "Burley, ID": 391483,
    "Durant, OK": 259267,
    "Moultrie, GA": 299983,
    "Bogalusa, LA": 212333,
    "Cornelia, GA": 357033,
    "Hillsdale, MI": 262400,
    "Thomasville, GA": 303500,
    "Paragould, AR": 201483,
    "Greenville, MS": 130833,
    "Burlington, IA": 149800,
    "Madisonville, KY": 192633,
    "Menomonie, WI": 287850,
    "Shawano, WI": 277233,
    "Vicksburg, MS": 205317,
    "Bedford, IN": 207950,
    "Grand Rapids, MN": 299450,
    "Washington, NC": 380000,
    "Freeport, IL": 158467,
    "Harrison, AR": 298817,
    "Rolla, MO": 280300,
    "Coldwater, MI": 278883,
    "Marion, NC": 306617,
    "Huntingdon, PA": 210800,
    "Ellensburg, WA": 658142,
    "Ponca City, OK": 149617,
    "Lawrenceburg, TN": 313333,
    "McAlester, OK": 232833,
    "Mount Pleasant, TX": 330167,
    "Willmar, MN": 336782,
    "Rockingham, NC": 209833,
    "Muscatine, IA": 218317,
    "Lewisburg, PA": 388783,
    "Auburn, IN": 262433,
    "Duncan, OK": 187617,
    "Sedalia, MO": 237183,
    "Cedartown, GA": 277300,
    "Henderson, NC": 278117,
    "Aberdeen, SD": 261567,
    "Rock Springs, WY": 312000,
    "Garden City, KS": 274333,
    "Stephenville, TX": 491300,
    "Celina, OH": 218783,
    "Wilmington, OH": 246167,
    "Bucyrus, OH": 169783,
    "Alma, MI": 191883,
    "El Campo, TX": 270140,
    "Mountain Home, AR": 256583,
    "Gainesville, TX": 419000,
    "Tifton, GA": 292100,
    "Blytheville, AR": 143250,
    "McMinnville, TN": 314666,
    "Astoria, OR": 583833,
    "Bradford, PA": 154750,
    "Espa-¦ola, NM": 355000,
    "McComb, MS": 197967,
    "Big Stone Gap, VA": 157916,
    "Marshalltown, IA": 203250,
    "Big Rapids, MI": 283300,
    "Austin, MN": 216450,
    "Selinsgrove, PA": 245416,
    "West Plains, MO": 242783,
    "Okeechobee, FL": 175000,
    "Houghton, MI": 221317,
    "Moscow, ID": 490667,
    "Clewiston, FL": 194000,
    "Riverton, WY": 399650,
    "El Dorado, AR": 235033,
    "Selma, AL": 93083,
    "Pittsburg, KS": 173000,
    "Hannibal, MO": 175133,
    "Warren, PA": 182517,
    "Alexandria, MN": 392433,
    "Urbana, OH": 269967,
    "Greenwood, MS": 159150,
    "Cambridge, OH": 175617,
    "Williston, ND": 346450,
    "Defiance, OH": 184933,
    "Sikeston, MO": 138933,
    "Safford, AZ": 336333,
    "Jacksonville, IL": 142950,
    "Ada, OK": 227800,
    "Brownwood, TX": 248633,
    "Crawfordsville, IN": 221733,
    "Logansport, IN": 182967,
    "Scottsbluff, NE": 239650,
    "Natchitoches, LA": 274667,
    "Newberry, SC": 329167,
    "Lock Haven, PA": 215433,
    "Centralia, IL": 137550,
    "Easton, MD": 620628,
    "Owatonna, MN": 304483,
    "Mount Vernon, IL": 153167,
    "Minden, LA": 196667,
    "Laramie, WY": 432333,
    "Murray, KY": 288117,
    "Fremont, NE": 246600,
    "Bennington, VT": 542000,
    "Fort Dodge, IA": 161583,
    "Sault Ste. Marie, MI": 247800,
    "Campbellsville, KY": 264850,
    "Dyersburg, TN": 221650,
    "Atmore, AL": 194967,
    "Escanaba, MI": 189717,
    "Mayfield, KY": 204417,
    "Kill Devil Hills, NC": 691467,
    "Sulphur Springs, TX": 369000,
    "Hutchinson, MN": 296200,
    "Coshocton, OH": 180983,
    "Huntington, IN": 211883,
    "DeRidder, LA": 230633,
    "Vincennes, IN": 191050,
    "Bay City, TX": 311000,
    "North Platte, NE": 218333,
    "Peru, IN": 159800,
    "Pontiac, IL": 150883,
    "Lebanon, MO": 232450,
    "Newport, TN": 368833,
    "Decatur, IN": 223783,
    "Vidalia, GA": 254100,
    "Brenham, TX": 394333,
    "Vernal, UT": 337067,
    "Bonham, TX": 360765,
    "Ottumwa, IA": 166817,
    "Butte, MT": 309667,
    "Corinth, MS": 233300,
    "Brookhaven, MS": 196267,
    "Emporia, KS": 181433,
    "Jackson, WY": 1316666,
    "Winfield, KS": 140833,
    "Big Spring, TX": 203633,
    "Effingham, IL": 294650,
    "Dodge City, KS": 281817,
    "Watertown, SD": 334950,
    "Angola, IN": 354150,
    "Dixon, IL": 169667,
    "Laurinburg, NC": 191450,
    "Taos, NM": 612332,
    "Brookings, SD": 344233,
    "Americus, GA": 242467,
    "Columbus, NE": 297833,
    "Taylorville, IL": 142217,
    "Arcadia, FL": 344800,
    "Lewisburg, TN": 395933,
    "Seneca Falls, NY": 297967,
    "Dickinson, ND": 338117,
    "Pella, IA": 284900,
    "Washington, IN": 233317,
    "Troy, AL": 249983,
    "Malvern, AR": 222967,
    "Frankfort, IN": 206667,
    "Madison, IN": 272967,
    "Brevard, NC": 576000,
    "Susanville, CA": 288750,
    "Martin, TN": 232967,
    "Plainview, TX": 207433,
    "Mount Gay, WV": 139165,
    "Dayton, TN": 324500,
    "Jackson, OH": 242783,
    "Cambridge, MD": 290617,
    "Paris, TN": 275583,
    "Jennings, LA": 190333,
    "Juneau, AK": 497333,
    "Coffeyville, KS": 141150,
    "Las Vegas, NM": 278167,
    "Berlin, NH": 296283,
    "Cleveland, MS": 163633,
    "Hastings, NE": 262025,
    "Beeville, TX": 185167,
    "Kingsville, TX": 168617,
    "Wabash, IN": 164333,
    "Breckenridge, CO": 1070833,
    "St. Marys, PA": 156500,
    "Central City, KY": 202917,
    "Albert Lea, MN": 238233,
    "Sheridan, WY": 538817,
    "Union City, TN": 216600,
    "Miami, OK": 208633,
    "Iron Mountain, MI": 163933,
    "Jesup, GA": 260467,
    "McPherson, KS": 227133,
    "Kirksville, MO": 163833,
    "Ludington, MI": 317817,
    "Bainbridge, GA": 250083,
    "Alpena, MI": 178117,
    "Washington Court House, OH": 239933,
    "Hays, KS": 225000,
    "Fort Morgan, CO": 359667,
    "Van Wert, OH": 166000,
    "Hope, AR": 146333,
    "Kennett, MO": 122150,
    "Weatherford, OK": 195697,
    "Mountain Home, ID": 387950,
    "Mineral Wells, TX": 505483,
    "Lincoln, IL": 146500,
    "Silver City, NM": 274333,
    "Elkins, WV": 216450,
    "Bluffton, IN": 258267,
    "Macomb, IL": 122733,
    "Camden, AR": 145500,
    "Crescent City, CA": 473833,
    "North Vernon, IN": 240833,
    "Eufaula, AL": 246167,
    "Thomaston, GA": 224133,
    "Union, SC": 192633,
    "Grants, NM": 225667,
    "Bennettsville, SC": 134250,
    "Fredericksburg, TX": 795667,
    "Toccoa, GA": 233000,
    "The Dalles, OR": 394817,
    "Greensburg, IN": 284167,
    "Indianola, MS": 159900,
    "La Grande, OR": 268333,
    "Ottawa, KS": 264667,
    "New Ulm, MN": 224083,
    "Lexington, NE": 261300,
    "Great Bend, KS": 159133,
    "Spearfish, SD": 619833,
    "Wauchula, FL": 344567,
    "Marshall, MN": 194150,
    "Deming, NM": 193167,
    "Mexico, MO": 180650,
    "Fallon, NV": 420000,
    "Altus, OK": 239667,
    "Uvalde, TX": 393583,
    "Hailey, ID": 1199000,
    "Steamboat Springs, CO": 1410833,
    "Summerville, GA": 184933,
    "Moberly, MO": 173783,
    "Middlesborough, KY": 179833,
    "Woodward, OK": 163583,
    "Prineville, OR": 582167,
    "Scottsburg, IN": 219600,
    "Rockport, TX": 399300,
    "Hood River, OR": 716333,
    "Forrest City, AR": 134483,
    "Connersville, IN": 177800,
    "Mitchell, SD": 298283,
    "Marshall, MO": 175133,
    "Brookings, OR": 546817,
    "Yankton, SD": 306200,
    "Wahpeton, ND": 247933,
    "Magnolia, AR": 202467,
    "Elk City, OK": 193533,
    "Liberal, KS": 183567,
    "Worthington, MN": 264150,
    "Oskaloosa, IA": 198117,
    "Pampa, TX": 147483,
    "Clarksdale, MS": 108733,
    "Sterling, CO": 261667,
    "Beatrice, NE": 236000,
    "Jamestown, ND": 216117,
    "Levelland, TX": 246115,
    "Grenada, MS": 147933,
    "Maryville, MO": 197750,
    "Arkadelphia, AR": 198425,
    "Dumas, TX": 201167,
    "Guymon, OK": 227167,
    "Borger, TX": 146133,
    "Pierre, SD": 326350,
    "Huron, SD": 224300,
    "Carroll, IA": 221167,
    "Storm Lake, IA": 211800,
    "Cordele, GA": 258950,
    "Evanston, WY": 369167,
    "Raymondville, TX": 219946,
    "Port Lavaca, TX": 163033,
    "Othello, WA": 304167,
    "Vineyard Haven, MA": 2014167,
    "Parsons, KS": 137383,
    "Price, UT": 270000,
    "Ruidoso, NM": 515000,
    "Fairmont, MN": 191333,
    "Portales, NM": 184050,
    "Los Alamos, NM": 583167,
    "West Point, MS": 199233,
    "Hereford, TX": 153483,
    "Pearsall, TX": 230742,
    "Andrews, TX": 277500,
    "Brownsville, TN": 208933,
    "Spirit Lake, IA": 459900,
    "Fitzgerald, GA": 171667,
    "Winnemucca, NV": 358300,
    "Maysville, KY": 194850,
    "Snyder, TX": 179667,
    "Helena, AR": 144317,
    "Spencer, IA": 220417,
    "Atchison, KS": 183000,
    "Fairfield, IA": 195500,
    "Vermillion, SD": 258317,
    "Sweetwater, TX": 154300,
    "Pecos, TX": 240667,
    "Zapata, TX": 150333,
    "Ketchikan, AK": 434417,
    "Craig, CO": 379967,
    "Vernon, TX": 169633,
    "Lamesa, TX": 176650,
  },
  getMedianHomePrice = (county, stateCode) => {
    county = county.toUpperCase();
    stateCode = stateCode.toUpperCase();

    const matchedKeysArray = Object.keys(medianHomePriceObj).filter(
      (countyStateCode) => {
        return countyStateCode.toUpperCase().split(", ").includes(stateCode);
      }
    );
    let matchedKeys = matchedKeysArray.filter((key) => {
        return key.toUpperCase().includes(county);
      }),
      medianHomePrice = 0;
    matchedKeys = matchedKeys.length > 0 ? matchedKeys : matchedKeysArray;

    medianHomePrice =
      medianHomePriceObj[matchedKeys[0]] || medianHomePriceObj["United States"];
    // console.log({ county, stateCode, medianHomePrice });

    return medianHomePrice;
  },
  handleChartStyle = () => {
    const annotationElements = Array.from(
      document.querySelectorAll(".infolayer .annotation")
    );
    annotationElements.forEach(
      (e) => (e.style.transform = `translate(0px, -15px)`)
    );
  };

const homeBase64 =
  "data:image/png;base64,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";
const ChartComponent = ({
  xValues,
  yValues,
  forecastedAppreciationPercent,
  appreciationTypes = "custom",
  year,
}) => {
  let showIndex =
      year == 7
        ? [0, 2, 4, 6, 7]
        : year == 8
        ? [0, 2, 4, 6, 8]
        : year == 9
        ? [0, 2, 4, 6, 8, 9]
        : year == 10
        ? [0, 2, 4, 6, 8, 10]
        : year == 11
        ? [0, 2, 4, 6, 8, 10, 11]
        : year == 12
        ? [0, 2, 4, 6, 8, 10, 12]
        : year == 13
        ? [0, 2, 4, 6, 8, 10, 12, 13]
        : year == 14
        ? [0, 2, 4, 6, 8, 10, 12, 14]
        : year == 15
        ? [0, 3, 6, 9, 12, 15]
        : [0, 1, 2, 3, 4, 5, 6, 7, 8].slice(0, year + 1),
    showIndexLength = showIndex.length;

  xValues = xValues
    .filter((_, index) => showIndex.includes(index))
    .map((value) => Number(value));
  yValues = yValues
    .filter((_, index) => showIndex.includes(index))
    .map((value) => Number(value));
  let size = 4000;

  const [visibleTraces, setVisibleTraces] = useState(true),
    data = [
      {
        x: xValues,
        y: yValues,
        mode: "lines+markers",
        line: { color: "#508bc9", width: 2 },
        marker: {
          size: isMobile ? 25 : 30,
          color: "#508bc9",
          symbol: "circle",
        },
        textposition: showIndex.map((_, index) => {
          if (showIndexLength - 1 === index) return "bottom center";
          return "top center";
        }),
        hoverinfo: "none",
        visible: visibleTraces ? true : "legendonly",
        text: yValues.map(
          (value, i) =>
            `<b style="color: ${i == 0 ? "black" : "#508bc9"};font-size:${
              isMobile ? 10 : 12
            }px">$${value.toLocaleString()}`
        ),
      },
    ],
    sizeyArray = showIndex.map((_, index) => {
      size =
        (index / 2 === 0 ? size + 900 : size + 600) +
        index * (year == 4 ? 60 : year == 5 ? 80 : year == 6 ? 80 : 1000);
      return size;
    }),
    images = xValues.map((x, index) => ({
      source: homeBase64,
      xref: "x",
      yref: "y",
      x: x,
      y: yValues[index],
      // sizex: 0.3,
      // sizey: sizeyArray[showIndexLength - 2],
      xanchor: "center",
      yanchor: "middle",
      layer: "above",
      // sizing: "fill",
    })),
    layout = {
      title: "",
      xaxis: {
        title: "<b>Years</b>",
        tickmode: "array",
        tickvals: xValues,
        tick0: 0,
        dtick: 2,
        range: [-1, Math.max(...xValues) + 1],
        showgrid: false,
        zeroline: false,
      },
      yaxis: {
        title: "",
        tickprefix: "$",
        tickformat: ",.0s",
        range: [Math.min(...yValues) - 50000, Math.max(...yValues) + 50000],
      },
      images: images,
      showlegend: false,
      staticPlot: true,
      dragmode: false,
      margin: { t: 30, b: 70, l: 40, r: 0 },
      annotations: yValues.map((val, i) => ({
        x: xValues[i],
        y: yValues[i],
        text: formatCurrency(yValues[i], 0),
        xanchor: "center",
        yanchor: "bottom",
        showarrow: true,
        ax: 0,
        ay: -6,
        bgcolor: "white",
        arrowcolor: "#c1d0ce",
        font: {
          color: year === val ? "#31a156" : "black",
          size: 13,
          weight: "bold",
        },
        borderpad: 4,
        bordercolor: "#c1d0ce",
      })),
    };
  if (isMobile) {
    layout["width"] = "unset";
  }

  useScrollIndicator(".netGainChart", ".netGainChartScrollIndicator");
  return (
    <div
      style={{
        fontSize: 30,
        textAlign: "center",
        margin: "0 0 30px 0",
        position: "relative",
      }}
    >
      <label className="chart-legend">
        <input
          style={{ height: 20, width: 20, marginRight: 10 }}
          type="checkbox"
          checked={visibleTraces}
          onChange={() => setVisibleTraces(!visibleTraces)}
        />
        Avg. annual {appreciationTypes} appreciation (
        {formatPercentage(forecastedAppreciationPercent, 0)})
      </label>
      <div>
        <Plot
          style={{
            width: "100%",
            overflowX: "auto",
          }}
          className="netGainChart"
          data={data}
          layout={layout}
          config={{ displayModeBar: false, doubleClick: false }}
          onUpdate={handleChartStyle}
        />
        {isMobile && isApp && (
          <div
            className="scrollIndicatorWrapper"
            style={{ backgroundColor: "#f4f8f8" }}
          >
            <div className="netGainChartScrollIndicator scrollIndicator"></div>
          </div>
        )}
      </div>
    </div>
  );
};
const Appreciation = () => {
  const [inputSource, setInputSource] = useState({
      clientName: "",
      location: "",
      price: "",
      downPayment: "",
      closingCosts: "",
      appCalcCustomRate: 4,
    }),
    [processingStatus, setProcessingStatus] = useState(
      loanId ? "location,closingCosts" : ""
    ),
    [currentScreen, setCurrentScreen] = useState("inputBlock"), //inputBlock
    [year, setYear] = useState(5),
    [editScreen, setEditScreen] = useState(null),
    [focusElement, setFocusElement] = useState({ target: null, top: 0 }),
    [tempInputSource, setTempInputSource] = useState({
      clientName: "",
      location: "",
      price: "",
      downPayment: "",
      closingCosts: "",
      appCalcCustomRate: 4,
    }),
    [outputSource, setOutputSource] = useState({}),
    [downPaymentDetails, setDownPaymentDetails] = useState([]);

  const handleInputSource = ({ name, value }) => {
    setInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };
  const handleTempInputSource = ({ name, value }) => {
    setTempInputSource((prevInputSource) => {
      return { ...prevInputSource, [name]: value };
    });
  };
  useEffect(() => {
    if (loanId) {
      (async () => {
        let response = await handleGetLoanData(loanId);

        const {
            clientName,
            zipCode,
            DownPayment: downPayment,
            closingCosts = 0,
            ["Purchase Price"]: price,
          } = response,
          iInputSource = {
            clientName,
            price,
            downPayment,
            closingCosts,
            appCalcCustomRate: 4,
          };
        const iDownPaymentDetails = handleGetDownPaymentDetails({
          loanAmt: 0,
          purValue: price,
        });
        setDownPaymentDetails(iDownPaymentDetails);
        setInputSource(iInputSource);
        setTempInputSource(iInputSource);

        handleAPI({
          name: "GetLocationData",
          params: { text: zipCode },
        })
          .then((response) => {
            const location = JSON.parse(response || '{"Table":[]}')["Table"][0][
              "label"
            ];
            const [, county, stateCode] = location.split(", "),
              medianHomePrice = getMedianHomePrice(county, stateCode);
            setInputSource((prevInputSource) => {
              return {
                ...prevInputSource,
                location,
                medianHomePrice,
              };
            });
            setTempInputSource((prevInputSource) => {
              return {
                ...prevInputSource,
                location,
                medianHomePrice,
              };
            });
            setProcessingStatus((prevProcessingStatus) => {
              return prevProcessingStatus
                .replace("location", "")
                .replace(",", "");
            });
          })
          .catch((e) => console.error("Error From GetLocationData ====>", e));
      })();

      (async () => {
        handleAPI({
          name: "GetClosingCostDetails",
          params: { loanId },
        })
          .then((response) => {
            const closingCosts = JSON.parse(response) || 0;
            setInputSource((prevInputSource) => {
              return {
                ...prevInputSource,
                closingCosts,
              };
            });
            setTempInputSource((prevInputSource) => {
              return {
                ...prevInputSource,
                closingCosts,
              };
            });
            setProcessingStatus((prevProcessingStatus) => {
              return prevProcessingStatus
                .replace("closingCosts", "")
                .replace(",", "");
            });
          })
          .catch((e) => console.error("Error From GetLocationData ====>", e));
      })();
    }
    require("react-range-slider-input/dist/style.css");
    const styleElement = document.createElement("style");

    styleElement.innerHTML = `
    @media screen and (max-width: ${parseInt(w)}px) {
      .rbBodyWrapper{
        margin: 2.5rem 0px 15rem !important;
      }
      .rbResultBodyWrapper {
        display: unset;
      }
      .bsHeaderTab,
      .bsFooterTab {
        padding: 0 13px; 
      }
      .amortSchedule *{
        font-size:12px !important
      }
      .rbResultBodyWrapper > div {
        width: unset !important;
        margin:0
      }
      .sliderContainer{
        width:unset
      }
      .floatingScreen{
        width:100%;
        min-width: unset;
        padding:0
        }
        .floatingScreenWrapper{
          width:100%;
          min-width: 100%;
          }
      .bsBodyTab{
        margin: 25px 13px;
      }
        .forecasted-Appreciation-table tr{
        display:flex;
        flex-direction:column;
        align-items:center;
    }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const handleEditMode = (screenName) => {
    setEditScreen(screenName);

    document.querySelector("body").style.overflow = screenName
      ? "hidden"
      : "auto";

    document.querySelector("body").style.paddingRight = screenName
      ? getScrollbarWidth() + "px"
      : 0;
  };
  const getScrollbarWidth = () => {
    const scrollDiv = document.createElement("div");
    scrollDiv.style.width = "100px";
    scrollDiv.style.height = "100px";
    scrollDiv.style.overflow = "scroll";
    scrollDiv.style.position = "absolute";
    scrollDiv.style.top = "-9999px";
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  };
  const customApprValues = (e, a, n, r) => {
    const A = (e, a) => ((a - e) / e) * 100 || 0,
      I = (e, a, n) => {
        let r = 0,
          t = Math.abs(A(n, e));
        return (
          t > 400
            ? (r = 0.8)
            : t > 350
            ? (r = 0.6)
            : t > 300
            ? (r = 0.4)
            : t > 250 && (r = 0.2),
          a * (1 - r)
        );
      },
      B = function (...argument) {
        const [e, a] = argument;
        let n = argument.length > 2 && void 0 !== argument[2] ? argument[2] : 0,
          r = argument.length > 3 && void 0 !== argument[3] ? argument[3] : 1;
        return 0 === n ? 0 : n * Math.pow(1 + e / 100, a / r);
      };

    let t = true, // !(arguments.length > 4) || void 0 === arguments[4] || arguments[4],
      l = false, //arguments.length > 5 && void 0 !== arguments[5] && arguments[5],
      o = r || e,
      m = e,
      i = [
        {
          price: e,
          percentChange: 0,
          year: 0,
          month: 0,
        },
      ];
    for (let r = 0; r < n; r++) {
      let n = A(e, (m = B(t ? I(m, a, o) : a, 1, m, l ? 12 : 1)));
      i.push({
        price: Math.round(m),
        percentChange: n,
        year: l ? Math.ceil((r + 1) / 12) : r + 1,
        month: l ? r + 1 : 1,
      });
    }
    return i;
  };
  useEffect(() => {
    if (currentScreen === "resultBlock" && !editScreen) {
      const {
        price,
        downPayment,
        closingCosts,
        appCalcCustomRate,
        medianHomePrice,
      } = inputSource;

      const iCustomApprValues = customApprValues(
        price,
        4,
        15,
        medianHomePrice,
        true
      );

      const [yValues, xValues] = iCustomApprValues.reduce(
        (acc, { price, year }) => {
          acc[0].push(price);
          acc[1].push(year);
          return acc;
        },
        [[], []]
      );
      setChartData({ xValues, yValues });
      const a = (t) => t / year;
      let n = price,
        d = iCustomApprValues[year].price,
        p = d - n,
        g = ((p - closingCosts) / downPayment) * 100;
      setOutputSource({
        appreciationTypes: "custom",
        estimatedHomeValue: n,
        customPercent: appCalcCustomRate,
        customHomeValue: d,
        customAppreciation: p,
        yearlyCustomAppreciation: a(p),
        customROI: g,
        yearlyCustomROI: a(g),
        downPayment: downPayment,
        closingCosts: closingCosts,
      });
    }
  }, [year, currentScreen, editScreen]);
  const handleValidateFields = () => {
    let isValid = false,
      {
        clientName,
        location,
        price = 0,
        downPayment = 0,
        closingCosts = 0,
        appCalcCustomRate = 0,
      } = inputSource;

    if (
      clientName &&
      location &&
      Number(price) &&
      Number(downPayment) &&
      Number(appCalcCustomRate) &&
      Number(closingCosts)
    ) {
      isValid = true;
    }
    return !isValid;
  };
  const [chartData, setChartData] = useState({
    xValues: [0],
    yValues: [5060028],
  });

  const handleSliderChange = (newValues) => {
    setYear(newValues[1]);
  };

  return (
    <div className="appreciation-container">
      <div className="brHeaderWrapper">
        <div className="brHeader">
          <h2
            className="brHeaderText"
            style={{ height: 100, alignContent: "center" }}
          >
            Appreciation
          </h2>
        </div>
      </div>
      {currentScreen === "inputBlock" ? (
        <>
          <div className="bsBodyTab">
            <div style={{ margin: "15px" }}>
              <InputBox
                type="text"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                label="Client name"
                placeholder=" Separate names with commas. E.g.) John Smith, Jane Smith."
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "clientName" });
                }}
                value={inputSource["clientName"]}
              />
              <AutoCompleteInputBox
                onSelect={(value) => {
                  value = value["label"];
                  if (value) {
                    const [, county, stateCode] = value.split(", "),
                      medianHomePrice = getMedianHomePrice(county, stateCode);
                    handleInputSource({
                      name: "medianHomePrice",
                      value: medianHomePrice,
                    });
                  }
                  handleInputSource({
                    value,
                    name: "location",
                  });
                }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                style={{ marginBottom: 25, paddingLeft: 10 }}
                label="Location"
                placeholder="Enter city, county, or ZIP code"
                listIcon={
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    style={{ marginRight: 5 }}
                  />
                }
                iProcessingStatus={
                  processingStatus.includes("location") ? "searching" : null
                }
                value={inputSource["location"]}
                symbol={
                  <span
                    style={{
                      position: "absolute",
                      left: 13,
                      fontFamily: "inter",
                      fontSize: 14,
                    }}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                }
              />
              <InputBox
                type="text"
                style={{ marginBottom: 25 }}
                inputMode="numeric"
                format="Currency"
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                label="Price"
                placeholder="Price"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "price" });
                }}
                value={inputSource["price"]}
              />
              <InputBox
                type="text"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                inputMode="numeric"
                format="Currency"
                label="Down Payment"
                placeholder="Down Payment"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "downPayment" });
                }}
                value={inputSource["downPayment"]}
                onFocus={(event) => {
                  const boundary =
                      event?.currentTarget?.getBoundingClientRect(),
                    top = boundary["bottom"] + 35,
                    width = boundary["width"] + 16;

                  setFocusElement({
                    target: "downPayment",
                    top,
                    width,
                  });
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setFocusElement({ target: null, top: 0 });
                  }, 300);
                }}
              />
              {focusElement["target"] === "downPayment" && (
                <div
                  style={{
                    width: focusElement["width"],
                    top: focusElement["top"],
                    position: "absolute",
                    zIndex: 4,
                    backgroundColor: "#fff",
                    marginTop: -25,
                  }}
                >
                  <table
                    className="popUpTable"
                    style={{ marginTop: 0 }}
                    cellSpacing={0}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: 80, textAlign: "center" }}>
                          Down Payment %
                        </th>
                        <th>Down Payment</th>
                        <th>Loan Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downPaymentDetails.map(
                        ({ percentage, downPayment, loanAmt }, index) => (
                          <tr
                            key={index}
                            onClick={() => {
                              handleInputSource({
                                value: downPayment,
                                name: "downPayment",
                              });
                            }}
                          >
                            <td>{percentage}% </td>
                            <td>{formatCurrency(downPayment)}</td>
                            <td>{formatCurrency(loanAmt)}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <InputBox
                type="text"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                inputMode="numeric"
                format={
                  processingStatus.includes("closingCosts") ? "" : "Currency"
                }
                label="Closing Costs"
                placeholder="Closing Costs"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({ value, name: "closingCosts" });
                }}
                value={inputSource["closingCosts"]}
                symbolPosition="right"
                symbol={
                  processingStatus.includes("closingCosts") && (
                    <span
                      className="spinner"
                      style={{
                        position: "absolute",
                        right: 13,
                        top: 17,
                      }}
                    >
                      <FontAwesomeIcon icon={faSpinner} color="#508bc9" />
                    </span>
                  )
                }
              />

              <InputBox
                type="text"
                style={{ marginBottom: 25 }}
                inputBoxStyle={{ fontFamily: "Inter" }}
                validate={false}
                format="percentage"
                label="Appreciation Rate"
                placeholder="Rate"
                onChangeText={({ target }) => {
                  const { value } = target;
                  handleInputSource({
                    value,
                    name: "appCalcCustomRate",
                  });
                }}
                value={inputSource["appCalcCustomRate"]}
              />
            </div>
          </div>
          <div
            className="bsFooterTab"
            style={{
              marginTop: 25,
              textAlign: "right",
              zIndex: 1,
              position: "relative",
            }}
          >
            <button
              className="btnPrimary"
              style={{ padding: "10px 15px" }}
              type="button"
              disabled={handleValidateFields()}
              onClick={() => {
                setCurrentScreen("resultBlock");
                setTimeout(() => {
                  document.querySelector("#btn-card-edit")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 300);
              }}
            >
              Calculate{"  "}
              <FontAwesomeIcon icon={faChevronRight} color="#fff" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="rbBodyWrapper"
            style={{
              maxWidth: 1136,
              margin: "2.5rem auto 15rem",
              minHeight: "50vh",
              // display: "flex",
              // flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ padding: "0 15px" }}>
              <button
                className="btnPrimary"
                type="button"
                onClick={() => {
                  const iInputSource = {
                    clientName: "",
                    location: "",
                    price: "",
                    downPayment: "",
                    closingCosts: "",
                    appCalcCustomRate: 4,
                  };
                  setCurrentScreen("inputBlock");
                  setInputSource(iInputSource);
                  setTempInputSource(iInputSource);
                }}
              >
                Create New
              </button>
            </div>
            <div
              className={
                isMobile ? "rbResultBodyWrapperMobile" : "rbResultBodyWrapper"
              }
            >
              <div>
                <Card title="Client">
                  <div>
                    <span className="rbDarkWord">
                      <b>{inputSource["clientName"] || "Test"}</b>
                    </span>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    onClick={() => handleEditMode("Client")}
                  >
                    Edit
                  </button>
                </Card>
                {/* Property Info */}
                <Card title="Property">
                  <div>
                    <span className="rbDarkWord">
                      <p>{inputSource["location"]}</p>
                      <b>{formatCurrency(inputSource["price"])}</b>
                    </span>
                  </div>
                  <button
                    className="purpleSecButton"
                    type="button"
                    style={{
                      display: "block",
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                      textAlign: "start",
                    }}
                    onClick={() => {
                      setTempInputSource({ ...inputSource });
                      handleEditMode("Property");
                    }}
                    id="btn-card-edit"
                  >
                    Edit
                  </button>
                </Card>
              </div>

              <div
                className={
                  isMobile ? "rbBodyContainerMobile" : "rbBodyContainer"
                }
                style={{ minHeight: "50vh" }}
              >
                <div>
                  <h4
                    className="rbDarkValue"
                    style={{
                      lineHeight: "40px",
                      letterSpacing: 0.4,
                      fontSize: 24,
                      width: isMobile ? "100%" : "50%",
                      margin: "0 auto",
                    }}
                  >
                    {inputSource["location"]}
                  </h4>
                </div>
                <div
                  className="sliderContainerWrapper"
                  style={{
                    marginBottom: 10,
                    // paddingBottom: 40,
                    padding: "50px 10px 40px 10px",
                  }}
                >
                  <div className="sliderContainer">
                    <RangeSlider
                      defaultValue={[0, 5]}
                      min={1}
                      max={15}
                      step={1}
                      onInput={handleSliderChange}
                      thumbsDisabled={[true, false]}
                      rangeSlideDisabled={true}
                      id="rbRangeSelector"
                    />
                    <div
                      className="tooltip"
                      style={{
                        left:
                          document.querySelector(".range-slider__range")?.style
                            ?.width || "50%",
                      }}
                    >
                      <b>
                        {year} Year{year > 1 && "s"}
                      </b>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="App-title">
                    Appreciation after {year} Year{year > 1 && "s"}
                  </h3>
                  <div style={{ overflow: "auto" }}>
                    <table
                      style={{ minWidth: isMobile ? "100%" : 770 }}
                      className="forecasted-Appreciation-table"
                    >
                      <thead>
                        <tr>
                          <th
                            className="forecasted-Appreciation-head"
                            scope="col"
                            colSpan={3}
                            style={{ padding: "16px 5px" }}
                          >
                            <h5 className="forecasted-Appreciation">
                              Avg. annual {outputSource["appreciationTypes"]}{" "}
                              appreciation (
                              {formatPercentage(
                                inputSource["appCalcCustomRate"],
                                0
                              )}
                              )
                            </h5>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="section-box">
                            <h4>Estimated Home Value</h4>
                            <p className="section-text">
                              Starting Value:{" "}
                              <span className="bold">
                                {formatCurrency(inputSource["price"], 0)}
                              </span>
                            </p>
                          </td>
                          <td className="section-box">
                            <h4>
                              {formatCurrency(
                                outputSource["customHomeValue"],
                                0
                              )}
                            </h4>
                          </td>
                        </tr>
                        <tr>
                          <td className="section-box">
                            <h4>Appreciation</h4>
                          </td>
                          <td className="section-box">
                            <h4 className="green-text">
                              +
                              {formatCurrency(
                                outputSource["customAppreciation"],
                                0
                              )}
                            </h4>
                            <span className="green-text">
                              +
                              {formatCurrency(
                                outputSource["yearlyCustomAppreciation"],
                                0
                              )}
                            </span>{" "}
                            avg./yr
                          </td>
                        </tr>
                        <tr>
                          <td className="section-box">
                            <h4>Return on Investment</h4>
                            <p className="section-text">
                              Down Payment:{" "}
                              <span className="bold">
                                {formatCurrency(inputSource["downPayment"], 0)}
                              </span>
                            </p>
                            <p className="section-text">
                              Closing Costs:{" "}
                              <span className="bold">
                                {formatCurrency(inputSource["closingCosts"], 0)}
                              </span>
                            </p>
                          </td>
                          <td className="section-box">
                            <h4 className="green-text">
                              +{formatPercentage(outputSource["customROI"], 0)}
                            </h4>
                            <span className="green-text">
                              +
                              {formatPercentage(
                                outputSource["yearlyCustomROI"],
                                0
                              )}
                            </span>{" "}
                            avg./yr
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 20, width: "100%" }}>
                    <ChartComponent
                      year={year}
                      xValues={chartData["xValues"]}
                      yValues={chartData["yValues"]}
                      forecastedAppreciationPercent={
                        inputSource["appCalcCustomRate"]
                      }
                      appreciationTypes={outputSource["appreciationTypes"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`floatingScreenWrapper ${editScreen ? "visible" : ""}`}
          >
            <div
              onClick={() => handleEditMode(null)}
              className="floatingScreenSpace"
            ></div>

            <div
              className={isMobile ? "floatingScreen" : "floatingScreenWeb"}
              style={{ paddingRight: isMobile ? 0 : 20 }}
            >
              {isMobile && (
                <div
                  onClick={() => handleEditMode(null)}
                  className="floatingScreenClose"
                >
                  <FontAwesomeIcon icon={faChevronDown} className="fa-lg" />
                </div>
              )}
              {!isMobile && (
                <span
                  title="Close"
                  onClick={() => handleEditMode(null)}
                  style={{
                    color: "red",
                    position: "absolute",
                    right: 25,
                    top: 5,
                    fontSize: 32,
                    cursor: "pointer",
                  }}
                >
                  ×
                </span>
              )}
              <h2
                style={{
                  textAlign: "center",
                  marginTop: isMobile ? 30 : -10,
                }}
              >
                {editScreen}
              </h2>
              <div
                style={{
                  overflow: "auto",
                  maxHeight: isMobile ? "65vh" : "73vh",
                  padding: "15px",
                }}
              >
                {editScreen === "Client" ? (
                  <>
                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Client name"
                      placeholder=" Separate names with commas. E.g.) John Smith, Jane Smith."
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleTempInputSource({ value, name: "clientName" });
                      }}
                      value={tempInputSource["clientName"]}
                    />
                  </>
                ) : editScreen === "Property" ? (
                  <>
                    <AutoCompleteInputBox
                      onSelect={(value) => {
                        value = value["label"];
                        if (value) {
                          const [, county, stateCode] = value.split(", "),
                            medianHomePrice = getMedianHomePrice(
                              county,
                              stateCode
                            );
                          handleTempInputSource({
                            name: "medianHomePrice",
                            value: medianHomePrice,
                          });
                        }
                        handleTempInputSource({
                          value,
                          name: "location",
                        });
                      }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      style={{ marginBottom: 25 }}
                      label="Location"
                      placeholder="Enter address, city, county, or ZIP code."
                      listIcon={
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          style={{ marginRight: 5 }}
                        />
                      }
                      value={tempInputSource["location"]}
                      symbol={
                        <span
                          style={{
                            position: "absolute",
                            left: 13,
                            fontFamily: "inter",
                            fontSize: 14,
                          }}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                      }
                    />
                    <InputBox
                      type="text"
                      format="Currency"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      label="Price"
                      placeholder="Purchase Value"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleTempInputSource({ value, name: "price" });
                      }}
                      value={tempInputSource["price"]}
                    />

                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      inputMode="numeric"
                      format="Currency"
                      label="Down Payment"
                      placeholder="Down Payment"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleTempInputSource({ value, name: "downPayment" });
                      }}
                      value={tempInputSource["downPayment"]}
                      onFocus={(event) => {
                        const boundary =
                            event?.currentTarget?.getBoundingClientRect(),
                          top = boundary["y"] - 43,
                          width = boundary["width"] + 16;

                        setFocusElement({
                          target: "downPayment",
                          top,
                          width,
                        });
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setFocusElement({ target: null, top: 0 });
                        }, 300);
                      }}
                    />
                    {focusElement["target"] === "downPayment" && (
                      <div
                        style={{
                          width: focusElement["width"],
                          top: focusElement["top"],
                          position: "absolute",
                          zIndex: 4,
                          backgroundColor: "#fff",
                          marginTop: -25,
                        }}
                      >
                        <table
                          className="popUpTable"
                          style={{ marginTop: 0 }}
                          cellSpacing={0}
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 80, textAlign: "center" }}>
                                Down Payment %
                              </th>
                              <th>Down Payment</th>
                              <th>Loan Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {downPaymentDetails.map(
                              ({ percentage, downPayment, loanAmt }, index) => (
                                <tr
                                  key={index}
                                  onClick={() => {
                                    handleTempInputSource({
                                      value: downPayment,
                                      name: "downPayment",
                                    });
                                  }}
                                >
                                  <td>{percentage}% </td>
                                  <td>{formatCurrency(downPayment)}</td>
                                  <td>{formatCurrency(loanAmt)}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      inputMode="numeric"
                      format="Currency"
                      label="Closing Costs"
                      placeholder="Closing Costs"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleTempInputSource({ value, name: "closingCosts" });
                      }}
                      value={tempInputSource["closingCosts"]}
                    />

                    <InputBox
                      type="text"
                      style={{ marginBottom: 25 }}
                      inputBoxStyle={{ fontFamily: "Inter" }}
                      validate={false}
                      format="percentage"
                      label="Appreciation Rate"
                      placeholder="Rate"
                      onChangeText={({ target }) => {
                        const { value } = target;
                        handleTempInputSource({
                          value,
                          name: "appCalcCustomRate",
                        });
                      }}
                      value={tempInputSource["appCalcCustomRate"]}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  backgroundColor: "white",
                  padding: "20px",
                  bottom: 0,
                  position: "sticky",
                  zIndex: 3,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleEditMode(null)}
                  className="secondaryBtn"
                  style={{ marginRight: 10 }}
                >
                  Cancel
                </button>
                <button
                  className="btnPrimary"
                  type="button"
                  onClick={() => {
                    setInputSource((prevInputSource) => {
                      return {
                        ...prevInputSource,
                        ...tempInputSource,
                      };
                    });
                    handleEditMode(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Card = ({ title = "", children }) => {
  return (
    <div>
      <span className="rbDarkWord">
        <b>{title}</b>
      </span>
      <div className="rbCard">{children}</div>
    </div>
  );
};
export default Appreciation;
