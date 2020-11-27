using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace ReactANOVA
{



    public class Sample
    {
        public int n;
        public double mean;
        public double sd;
        public Sample()
        {
        }
        public Sample(int a, double b, double c)
        {
            n = a;
            mean = b;
            sd = c;
        }
    }
    public class Anova
    {

        static double[,] FivePercentAlphaSRT = {
            { -1,-1,-1,-1,-1,-1,-1,-1,-1},
            { -1,-1,-1,-1,-1,-1,-1,-1,-1},
            { -1,-1,-1,-1,-1,-1,-1,-1,-1},
            { -1,-1,-1,-1,-1,-1,-1,-1,-1},
            { -1,-1,-1,-1,-1,-1,-1,-1,-1},
            //5 Error df
            {3.64,4.60,5.22,5.67,6.04,6.33,6.58,6.80,6.99},
            //6
            {3.46,4.34,4.90,5.30,5.63,5.90,6.12,6.32,6.49},
            //7
            {3.34,4.16,4.68,5.06,5.36,5.61,5.82,6.00,6.16},
            //8
            {3.26,4.04,4.53,4.89,5.17,5.40,5.60,5.77,5.92},
            //9
            {3.20,3.95,4.41,4.76,5.02,5.24,5.43,5.59,5.74},
            //10
            {3.15,3.88,4.33,4.65,4.91,5.12,5.30,5.46,5.60},
            //11
            {3.11,3.82,4.26,4.57,4.82,5.03,5.20,5.35,5.49},
            //12
            {3.08,3.77,4.20,4.51,4.75,4.95,5.12,5.27,5.39},
            //13
            {3.06,3.73,4.15,4.45,4.69,4.88,5.05,5.19,5.32},
            //14
            {3.03,3.70,4.11,4.41,4.64,4.83,4.99,5.13,5.25},
            //15
            {3.01,3.67,4.08,4.37,4.59,4.78,4.94,5.08,5.20},
            //16
            {3.00,3.65,4.05,4.33,4.56,4.74,4.90,5.03,5.15},
            //17
            {2.98,3.63,4.02,4.30,4.52,4.70,4.86,4.99,5.11},
            //18
            {2.97,3.61,4.00,4.28,4.49,4.67,4.82,4.96,5.01},
            //19
            {2.96,3.59,3.98,4.25,4.47,4.65,4.79,4.92,5.04},
            //20
            {2.95,3.58,3.96,4.23,4.45,4.62,4.77,4.90,5.01},
            //24
            {2.92,3.53,3.90,4.17,4.37,4.54,4.68,4.81,4.92},
            //30
            {2.89,3.49,3.85,4.10,4.30,4.46,4.60,4.72,4.82},
            //40
            {2.86,3.44,3.79,4.04,4.23,4.39,4.52,4.63,4.73},
            //60
            {2.83,3.40,3.74,3.98,4.16,4.31,4.44,4.55,4.65},
            //120
            {2.80,3.36,3.68,3.92,4.10,4.24,4.36,4.47,4.56},
            //120+
            {2.77,3.31,3.63,3.86,4.03,4.17,4.29,4.39,4.47}
        };

        public static double GetSSTr(List<Sample> sa, double gm)
        {
            double SSTr = 0;
            for (int i = 0; i < sa.Count; i++)
            {
                SSTr += sa[i].n * Math.Pow(sa[i].mean - gm, 2);
            }
            return SSTr;
        }

        public static int GetTotalObservations(List<Sample> sa)
        {
            int N = 0;
            for (int i = 0; i < sa.Count; i++)
            {
                N += sa[i].n;
            }
            return N;
        }

        public static double GetGrandMean(List<Sample> sa)
        {
            double grandMean = 0;
            int N = 0;
            double T = 0;

            for (int i = 0; i < sa.Count; i++)
            {
                N += sa[i].n;
                T += sa[i].n * sa[i].mean;
            }
            grandMean = T / N;

            return grandMean;
        }

        public static double GetSSE(List<Sample> sa)
        {
            double SSE = 0;
            for (int i = 0; i < sa.Count; i++)
            {
                Console.WriteLine(SSE);
                SSE += (sa[i].n - 1) * Math.Pow(sa[i].sd, 2);
            }
            return SSE;
        }

        public static double GetMSTr(double SSTr, int k)
        {
            return SSTr / (k - 1);
        }

        public static double GetMSE(double SSE, int N, int k)
        {
            return SSE / (N - k);
        }


        public static double CalculateQ(double alpha, int numDataSets, int totalSamples)
        {

            int errorDF = totalSamples - numDataSets;
            int kIndex = numDataSets - 2;

            if (errorDF<5)
            {
                return FivePercentAlphaSRT[5, kIndex];
            }

            if (errorDF<=20)
            {
                return FivePercentAlphaSRT[errorDF,kIndex];
            }

            if (errorDF <= 22)
            {
                return FivePercentAlphaSRT[20, kIndex];
            }

            if (errorDF<=26)
            {
                return FivePercentAlphaSRT[21, kIndex];
            }

            if (errorDF <= 34)
            {
                return FivePercentAlphaSRT[22, kIndex];
            }

            if (errorDF <= 50)
            {
                return FivePercentAlphaSRT[23, kIndex];
            }

            if (errorDF <= 90)
            {
                return FivePercentAlphaSRT[24, kIndex];
            }

            if (errorDF <= 120)
            {
                return FivePercentAlphaSRT[25, kIndex];
            }

            return FivePercentAlphaSRT[26,kIndex];
        }

        public static List<double[]> TukeyKramerComparison(List<Sample> samples, double MSE)
        {
            int total = 0;
            List<double[]> intervals = new List<double[]>();
            for (int i = 0;i<samples.Count;i++)
            {
                total += samples[i].n;
            }
            double q = CalculateQ(0.05,samples.Count,total);
            //Debug.WriteLine(q);
            for (int i = 0; i < samples.Count - 1; i++)
            {
                for (int j = i + 1; j < samples.Count; j++)
                {
                    double range = q * Math.Sqrt(MSE / 2.0 * (1.0 / samples[i].n + 1.0 / samples[j].n));
                    Debug.WriteLine("[" + "mu" + (i + 1) + " - " + "mu" + (j + 1) + ": " + ((samples[i].mean - samples[j].mean) - range) + ", " + ((samples[i].mean - samples[j].mean) + range) + "]");
                    intervals.Add(new double[] { ((samples[i].mean - samples[j].mean) - range), ((samples[i].mean - samples[j].mean) + range) });

                }
            }
            return intervals;
        }

        public static Sample CreateSampleFromData(List<double> input)
        {
            double mean = 0;
            double sd = 0;
            int n = input.Count;
            for (int i = 0; i < input.Count; i++)
            {
                mean += input[i];
            }
            mean = mean / n;

            if (n>1)
            {
                for (int i = 0; i < input.Count; i++)
                {
                    sd += Math.Pow(input[i] - mean, 2);
                }
                sd /= (n - 1);
                sd = Math.Sqrt(sd);
            }

            Sample temp = new Sample(n, mean, sd);
            return temp;
        }
    }
}
