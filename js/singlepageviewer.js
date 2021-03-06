/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFSinglePageViewer) {
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

var DEFAULT_URL = "content/frankenstein.pdf";
var SEARCH_FOR = ""; // try 'Mozilla';

var container = document.getElementById("viewerContainer");

var eventBus = new pdfjsViewer.EventBus();

// (Optionally) enable hyperlinks within PDF files.
var pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus: eventBus,
});

// (Optionally) enable find controller.
var pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus: eventBus,
  linkService: pdfLinkService,
});

var pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer({
  container: container,
  eventBus: eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
});
pdfLinkService.setViewer(pdfSinglePageViewer);

eventBus.on("pagesinit", function () {
  // We can use pdfSinglePageViewer now, e.g. let's change default scale.
  pdfSinglePageViewer.currentScaleValue = "page-width";

  // We can try searching for things.
  if (SEARCH_FOR) {
    pdfFindController.executeCommand("find", { query: SEARCH_FOR });
  }
});

// Loading document.
var loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL
});
loadingTask.promise.then(function (pdfDocument) {
  // Document loaded, specifying document for the viewer and
  // the (optional) linkService.
  pdfSinglePageViewer.setDocument(pdfDocument);

  pdfLinkService.setDocument(pdfDocument, null);

  // current and total page labels
  document.getElementById('currentPageLabel').innerHTML = pdfSinglePageViewer.currentPageNumber;
  document.getElementById('totalPagesLabel').innerHTML = pdfSinglePageViewer.pdfDocument.numPages;

  pdfSinglePageViewer.eventBus.on('pagechanging', function pagechange(e) {
    document.getElementById('currentPageLabel').innerHTML = e.pageNumber;

    // update query param
    let url = new URL(window.location.href);
    url.searchParams.set('page', e.pageNumber);
    window.history.pushState('', '', url.href);
  });

});
