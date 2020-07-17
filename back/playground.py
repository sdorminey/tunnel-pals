import noise
import numpy as np
import matplotlib.pyplot as plt

shape = (256,256)
scale = 25.0
octaves = 6
persistence = 0.5
lacunarity = 2.0

world = np.zeros(shape)
for i in range(shape[0]):
        for j in range(shape[1]):
                world[i][j] = noise.pnoise2(i/scale, 
                                        j/scale, 
                                        octaves=octaves, 
                                        persistence=persistence, 
                                        lacunarity=lacunarity, 
                                        repeatx=256, 
                                        repeaty=256, 
                                        base=0)
        
plt.matshow(world > 0.25)
plt.show()
print("done")