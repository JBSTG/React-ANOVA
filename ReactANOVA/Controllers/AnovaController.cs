using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ReactANOVA;

namespace ReactANOVA.Controllers
{
    [ApiController]
    [Route("/Anova")]
    public class AnovaController : Controller
    {
        private readonly ILogger<AnovaController> _logger;

        public AnovaController(ILogger<AnovaController> logger)
        {
            _logger = logger;
        }

        [Route("/Anova/Post")]
        public JsonResult Post([FromBody]List<List<double>> body)
        {
            List<Sample> samples = new List<Sample>();
            for (int i = 0;i<body.Count;i++)
            {
                samples.Add(Anova.CreateSampleFromData(body[i]));
            }
            double grandMean = Anova.GetGrandMean(samples);
            Console.WriteLine("Grand Mean " + grandMean);
            double SSTr = Anova.GetSSTr(samples, grandMean);
            double SSE = Anova.GetSSE(samples);
            int N = Anova.GetTotalObservations(samples);
            int k = samples.Count;
            double MSTr = Anova.GetMSTr(SSTr, k);
            double MSE = Anova.GetMSE(SSE, N, k);

            Anova.TukeyKramerComparison(samples, MSE, 3.74);

            int df1 = k - 1;
            int df2 = N - k;

            return Json(new {
                grandMean=N,
                numDataSets=k,
                sumOfSquaresForTreatment=SSTr,
                sumSquaredErrors=SSE,
                meanSquareOftreatment=MSTr,
                meanSquareOfError=MSE,
                degreesOfFreedomOne=df1,
                degreesOfFreedomTwo=df2,
                fStatistic=MSTr/MSE,
                pValue=-1
            });
        }





    }
}
