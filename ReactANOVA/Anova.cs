using System;
using System.Collections.Generic;
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

		public static void TukeyKramerComparison(List<Sample> samples, double MSE, double q)
		{
			Console.WriteLine();
			for (int i = 0; i < samples.Count - 1; i++)
			{
				for (int j = i + 1; j < samples.Count; j++)
				{
					double range = q * Math.Sqrt(MSE / 2.0 * (1.0 / samples[i].n + 1.0 / samples[j].n));
					Console.WriteLine("[" + "mu" + (i + 1) + " - " + "mu" + (j + 1) + ": " + ((samples[i].mean - samples[j].mean) - range) + ", " + ((samples[i].mean - samples[j].mean) + range) + "]");
				}
			}
			Console.WriteLine();
		}

		public static double calculateP()
        {
			return 0.0;
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

			for (int i = 0; i < input.Count; i++)
			{
				sd += Math.Pow(input[i] - mean, 2);
			}
			sd /= (n - 1);
			sd = Math.Sqrt(sd);
			Sample temp = new Sample(n, mean, sd);
			return temp;
		}
	}
}
