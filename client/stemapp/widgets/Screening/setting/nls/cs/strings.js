///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define({
  "units": {
    "feetUnit": "Stopy / čtvereční stopy",
    "milesUnit": "Míle / akry",
    "metersUnit": "Metry / metry čtvereční",
    "kilometersUnit": "Kilometry / kilometry čtvereční",
    "hectaresUnit": "Kilometry / hektary"
  },
  "analysisTab": {
    "analysisTabLabel": "Analýza",
    "selectAnalysisLayerLabel": "Vybrat vrstvy analýzy",
    "addLayerLabel": "Přidat vrstvy",
    "noValidLayersForAnalysis": "Ve vybrané webové mapě nebyly nalezeny žádné vrstvy.",
    "noValidFieldsForAnalysis": "Ve vybrané webové mapě nebyla nalezena žádná platná pole. Odeberte vybranou vrstvu.",
    "addLayersHintText": "Nápověda: Vyberte vrstvy a pole pro analýzu a zobrazení ve zprávě",
    "addLayerNameTitle": "Jméno vrstvy",
    "addFieldsLabel": "Přidat pole",
    "addFieldsPopupTitle": "Vybrat pole",
    "addFieldsNameTitle": "Názvy polí",
    "aoiToolsLegendLabel": "Nástroje zájmové oblasti",
    "aoiToolsDescriptionLabel": "Povolte nástroje pro vytváření zájmových oblastí a určení jejich popisků",
    "placenameLabel": "Název místa",
    "drawToolsLabel": "Nástroje pro kreslení",
    "uploadShapeFileLabel": "Nahrát soubor shapefile",
    "coordinatesLabel": "Souřadnice",
    "coordinatesDrpDwnHintText": "Nápověda: Vyberte jednotku pro zobrazení zadaných polygonových pořadů",
    "coordinatesBearingDrpDwnHintText": "Nápověda: Vyberte azimut pro zobrazení zadaných polygonových pořadů",
    "allowShapefilesUploadLabel": "Povolit nahrání souborů shapefile pro analýzu",
    "allowShapefilesUploadLabelHintText": "Nápověda: Zobrazit položku Nahrát soubor shapefile v analýze na kartě Zprávy",
    "allowVisibleLayerAnalysisLabel": "Neanalyzovat ani nehlásit výsledky vrstev, které nejsou viditelné",
    "allowVisibleLayerAnalysisHintText": "Nápověda: Vrstvy, které jsou vypnuté nebo nejsou viditelné kvůli nastavení viditelnosti měřítka, nebudou analyzovány ani zahrnuty ve vytištěných nebo stažených výsledcích.",
    "areaUnitsLabel": "Zobrazit výsledky analýzy v",
    "maxFeatureForAnalysisLabel": "Max. počet prvků k analýze",
    "maxFeatureForAnalysisHintText": "Nápověda: Nastavte maximální počet prvků k analýze",
    "searchToleranceLabelText": "Tolerance vyhledávání",
    "searchToleranceHint": "Nápověda: Tato tolerance vyhledávání se používá pouze při analýze zadaných bodů a linií",
    "placenameButtonText": "Název místa",
    "drawToolsButtonText": "Vykreslit",
    "shapefileButtonText": "Shapefile",
    "coordinatesButtonText": "Souřadnice",
    "invalidLayerErrorMsg": "Nakonfigurujte prosím pole pro"
  },
  "downloadTab": {
    "downloadLegend": "Nastavení stahování",
    "reportLegend": "Nastavení zpráv",
    "downloadTabLabel": "Stáhnout",
    "syncEnableOptionLabel": "Vrstvy prvků",
    "syncEnableOptionHint": "Nápověda: Používá se ke stažení informací o prvku pro prvky protínající zájmovou oblast v uvedených formátech.",
    "syncEnableOptionNote": "Poznámka: Pro možnost souborové geodatabáze jsou vyžadovány Feature služby s povolenou synchronizací.",
    "extractDataTaskOptionLabel": "Úloha Extrakce Dat služby zpracování geografických dat",
    "extractDataTaskOptionHint": "Nápověda: Pomocí publikované Úlohy Extrakce Dat služby zpracování geografických dat můžete stáhnout prvky protínající zájmovou oblast ve formátech souborové geodatabáze a shapefile.",
    "cannotDownloadOptionLabel": "Zakázat stahování",
    "syncEnableTableHeaderTitle": {
      "layerNameLabel": "Jméno vrstvy",
      "csvFileFormatLabel": "CSV",
      "fileGDBFormatLabel": "Souborová geodatabáze",
      "allowDownloadLabel": "Povolit stahování"
    },
    "setButtonLabel": "Nastavit",
    "GPTaskLabel": "Zadejte adresu URL pro službu zpracování geografických dat",
    "printGPServiceLabel": "Adresa URL tiskové služby",
    "setGPTaskTitle": "Zadejte požadovanou adresu URL služby zpracování geografických dat",
    "logoLabel": "Logo",
    "logoChooserHint": "Nápověda: Kliknutím na ikonu obrázku změníte obrázek",
    "footnoteLabel": "Poznámka pod čarou",
    "columnTitleColorPickerLabel": "Barva názvů sloupce",
    "reportTitleLabel": "Název zprávy",
    "errorMessages": {
      "invalidGPTaskURL": "Neplatná služba zpracování geografických dat. Vyberte službu zpracování geografických dat obsahující úlohu extrakce dat.",
      "noExtractDataTaskURL": "Vyberte libovolnou službu zpracování geografických dat obsahující úlohu extrakce dat."
    }
  },
  "generalTab": {
    "generalTabLabel": "Obecné",
    "tabLabelsLegend": "Popisky panelu",
    "tabLabelsHint": "Nápověda: Zadejte popisky",
    "AOITabLabel": "Panel zájmové oblasti",
    "ReportTabLabel": "Panel zprávy",
    "bufferSettingsLegend": "Nastavení obalové zóny",
    "defaultBufferDistanceLabel": "Výchozí šířka obalové zóny",
    "defaultBufferUnitsLabel": "Jednotky obalové zóny",
    "generalBufferSymbologyHint": "Nápověda: Nastavte symbologii, která se použije k zobrazení obalových zón kolem definovaných zájmových oblastí.",
    "aoiGraphicsSymbologyLegend": "Symbologie grafiky zájmové oblasti",
    "aoiGraphicsSymbologyHint": "Nápověda: Nastavte symbologii, která se použije při definování bodových, liniových a polygonových zájmových oblastí.",
    "pointSymbologyLabel": "Bod",
    "previewLabel": "Náhled",
    "lineSymbologyLabel": "Linie",
    "polygonSymbologyLabel": "Polygon",
    "aoiBufferSymbologyLabel": "Symbologie obalové zóny",
    "pointSymbolChooserPopupTitle": "Symbol adresy nebo umístění",
    "polygonSymbolChooserPopupTitle": "Vyberte symbol pro zvýraznění polygonu.",
    "lineSymbolChooserPopupTitle": "Vyberte symbol pro zvýraznění linie.",
    "aoiSymbolChooserPopupTitle": "Nastavit symbol obalové zóny",
    "aoiTabText": "Zájmové oblasti",
    "reportTabText": "Zpráva",
    "invalidSymbolValue": "Neplatná hodnota symbolu."
  },
  "searchSourceSetting": {
    "searchSourceSettingTabTitle": "Nastavení zdroje vyhledávání",
    "searchSourceSettingTitle": "Nastavení zdroje vyhledávání",
    "searchSourceSettingTitleHintText": "Přidejte služby geokódování nebo vrstvy prvků a nakonfigurujte je jako zdroje vyhledávání. Tyto zadané zdroje budou určovat, co je možné vyhledávat v rámci pole pro hledání.",
    "addSearchSourceLabel": "Přidat zdroj vyhledávání",
    "featureLayerLabel": "Vrstva prvků",
    "geocoderLabel": "Geokodér",
    "generalSettingLabel": "Obecné nastavení",
    "allPlaceholderLabel": "Zástupný text pro vyhledávání všech výsledků:",
    "allPlaceholderHintText": "Nápověda: Zadejte text, který se má zobrazit jako zástupný při prohledávání všech vrstev a geokodéru.",
    "generalSettingCheckboxLabel": "Zobrazit vyskakovací okno pro nalezený prvek nebo umístění",
    "countryCode": "Kódy země nebo oblasti",
    "countryCodeEg": "např. ",
    "countryCodeHint": "Pokud toto pole ponecháte prázdné, prohledají se všechny země a oblasti",
    "questionMark": "?",
    "searchInCurrentMapExtent": "Vyhledávat pouze v aktuálním rozsahu mapy",
    "zoomScale": "Měřítko přiblížení",
    "locatorUrl": "URL geokodéru",
    "locatorName": "Název geokodéru",
    "locatorExample": "Příklad",
    "locatorWarning": "Tato verze služby geokódování není podporována. Tento widget podporuje službu geokódování verze 10.0 a novější.",
    "locatorTips": "Návrhy nejsou k dispozici, protože služba geokódování nepodporuje funkcionalitu návrhů.",
    "layerSource": "Zdroj vrstvy",
    "setLayerSource": "Nastavit zdroj vrstvy",
    "setGeocoderURL": "Nastavit adresu URL geokodéru",
    "searchLayerTips": "Návrhy nejsou k dispozici, protože služba Feature Service nepodporuje funkcionalitu stránkování.",
    "placeholder": "Zástupný text",
    "searchFields": "Prohledávané pole",
    "displayField": "Zobrazované pole",
    "exactMatch": "Přesná shoda",
    "maxSuggestions": "Maximální počet návrhů",
    "maxResults": "Maximální počet výsledků",
    "enableLocalSearch": "Povolit lokální vyhledávání",
    "minScale": "Min. měřítko",
    "minScaleHint": "Když je měřítko mapy větší než toto měřítko, použije se lokální vyhledávání.",
    "radius": "Poloměr",
    "radiusHint": "Stanoví poloměr oblasti okolo centra aktuální mapy, který se použije ke zvýšení hodnoty kandidátů geokódování, aby byli kandidáti nejblíže umístění vráceni jako první.",
    "setSearchFields": "Nastavit prohledávané pole",
    "set": "Nastavit",
    "invalidUrlTip": "Adresa URL ${URL} je neplatná nebo nepřístupná.",
    "invalidSearchSources": "Neplatné nastavení zdroje vyhledávání"
  },
  "errorMsg": {
    "textboxFieldsEmptyErrorMsg": "Vyplňte povinná pole",
    "bufferDistanceFieldsErrorMsg": "Zadejte platné hodnoty",
    "invalidSearchToleranceErrorMsg": "Zadejte platnou hodnotu pro toleranci vyhledávání",
    "atLeastOneCheckboxCheckedErrorMsg": "Neplatná konfigurace: Je potřeba alespoň jeden nástroj zájmové oblasti.",
    "noLayerAvailableErrorMsg": "Nejsou k dispozici žádné vrstvy",
    "layerNotSupportedErrorMsg": "Není podporováno ",
    "noFieldSelected": "Pomocí akce Upravit vyberte pole k analýze.",
    "duplicateFieldsLabels": "Pro „${itemNames}“ byl přidán duplicitní popisek „${labelText}“",
    "noLayerSelected": "Vyberte alespoň jednu vrstvu k analýze",
    "errorInSelectingLayer": "Výběr vrstvy nelze dokončit. Zkuste to znovu.",
    "errorInMaxFeatureCount": "Zadejte platný maximální počet prvků pro analýzu."
  }
});