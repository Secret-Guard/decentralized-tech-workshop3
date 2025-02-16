import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("iris")

print(df.head())

sns.pairplot(df, hue="species")
plt.show()
